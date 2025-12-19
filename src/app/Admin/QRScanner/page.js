"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { getAllEvents, getEventById } from "../../api/event";
import { scanTicketByQR } from "../../api/participant";
import {
  Users,
  UserCheck,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Camera,
  Power,
} from "lucide-react";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todayEvents, setTodayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [event, setEvent] = useState(null);
  const scannerRef = useRef(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  // Restart scanner when selected event changes
  useEffect(() => {
    if (!scannerInitialized || !selectedEvent) return;

    stopScanner();
    if (scanning) {
      setTimeout(() => startScanner(), 100);
    }
  }, [selectedEvent]);

  // Fetch today's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setFetchingEvents(true);
        setError(null);
        const response = await getAllEvents();

        if (response?.events) {
          const today = new Date().toDateString();
          const todayFiltered = response.events.filter((event) => {
            if (!event.date) return false;
            try {
              return new Date(event.date).toDateString() === today;
            } catch {
              return false;
            }
          });

          setTodayEvents(todayFiltered);
          if (todayFiltered.length > 0) {
            setSelectedEvent(todayFiltered[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load today's events.");
      } finally {
        setFetchingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch event details when selected event changes
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!selectedEvent) {
        setEvent(null);
        return;
      }

      try {
        const eventId = selectedEvent.id || selectedEvent._id;
        const response = await getEventById(eventId);
        setEvent(response?.event || response?.data || response);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setEvent(null);
      }
    };

    fetchEventDetails();
  }, [selectedEvent]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getEventId = (event) => event?.id || event?._id;

  const startScanner = () => {
    if (!selectedEvent) {
      setError("Please select an event first");
      return;
    }

    setError("");
    setScannerInitialized(true);

    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [],
      },
      false
    );

    scannerRef.current = scanner;

    const handleScanSuccess = async (qrData) => {
      scanner.pause();
      setScanning(false);
      setLoading(true);

      try {
        const eventId = getEventId(selectedEvent);
        const response = await scanTicketByQR(qrData, eventId);

        setScanResult(response.data.message);

        if (response.data.message === "Ticket scanned successfully") {
          refreshEventStats();
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Error scanning QR code"
        );
      } finally {
        setLoading(false);
        setTimeout(() => {
          setScanResult("");
          setError("");
          if (scannerRef.current) {
            scanner.resume();
            setScanning(true);
          }
        }, 2000);
      }
    };

    scanner.render(handleScanSuccess, (errorMessage) => {
      console.log("QR Scan error:", errorMessage);
    });

    setScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
    setScannerInitialized(false);
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      startScanner();
    } catch {
      setError("Camera permission denied. Please enable camera access.");
    }
  };

  const refreshEventStats = async () => {
    if (!selectedEvent) return;
    try {
      const eventId = getEventId(selectedEvent);
      const response = await getEventById(eventId);
      setEvent(response?.event || response?.data || response);
    } catch (error) {
      console.error("Error refreshing event:", error);
      setError("Failed to refresh ticket statistics");
    }
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = todayEvents.find((ev) => getEventId(ev) === eventId);
    setSelectedEvent(event || null);
  };

  const ticketStatus = event?.ticketStatus;
  const totalPlayers = ticketStatus?.totalNumberOfPlayers || 0;
  const unscanned = ticketStatus?.unscannedTickets || 0;
  const scanned = Math.max(0, totalPlayers - unscanned);
  const scanProgress = totalPlayers > 0 ? (scanned / totalPlayers) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent mb-2">
            Ticket QR Scanner
          </h1>
          <p className="text-gray-600 font-semibold">
            Check in attendees by scanning their QR codes
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event Selection & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Event Selector */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Event
              </h2>

              {fetchingEvents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
                </div>
              ) : todayEvents.length > 0 ? (
                <div className="space-y-3">
                  <select
                    onChange={handleEventChange}
                    value={selectedEvent ? getEventId(selectedEvent) : ""}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                  >
                    <option value="">Choose an event...</option>
                    {todayEvents.map((ev) => (
                      <option key={getEventId(ev)} value={getEventId(ev)}>
                        {ev.eventName} - {formatDate(ev.date)}
                      </option>
                    ))}
                  </select>

                  {selectedEvent && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 space-y-2">
                      <p className="text-sm font-semibold text-red-900">
                        {selectedEvent.eventName}
                      </p>
                      {selectedEvent.venue && (
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {selectedEvent.venue}
                        </p>
                      )}
                      {selectedEvent.date && (
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(selectedEvent.date).toLocaleString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      )}
                      {selectedEvent.time && (
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedEvent.time}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    No events today
                  </p>
                </div>
              )}

              {error && !fetchingEvents && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Ticket Stats */}
            {ticketStatus && (
              <div className="space-y-3">
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-gray-600">Capacity</p>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    {ticketStatus.maximumOccupancy || 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-gray-600">Registered</p>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    {totalPlayers}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Ticket className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <p className="text-3xl font-bold text-red-700">{unscanned}</p>
                </div>

                {totalPlayers > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Check-in Progress
                    </p>
                    <div className="mb-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {scanned} / {totalPlayers}
                      </span>
                      <span className="font-semibold text-red-600">
                        {Math.round(scanProgress)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Scanner */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scanner Container */}
            <div className="relative bg-gray-700 rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div
                id="qr-reader"
                className="relative w-full aspect-square"
              ></div>
              {!scanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/images/qr_code.gif"
                    alt="Loading GIF"
                    className="w-full h-full"
                  />
                </div>
              ) : null}

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-red-700 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-semibold text-gray-900">
                    Validating ticket...
                  </p>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex gap-3">
              {!scanning ? (
                <button
                  onClick={requestCameraPermission}
                  disabled={!selectedEvent || fetchingEvents}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    selectedEvent && !fetchingEvents
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  Start Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="flex-1 text-white bg-red-600  py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Power className="w-5 h-5" />
                  Stop Scanner
                </button>
              )}
            </div>

            {/* Success Message */}
            {scanResult && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center animate-pulse">
                <CheckCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-900">Success!</h3>
                <p className="text-red-700 mt-1">{scanResult}</p>
              </div>
            )}

            {/* Error Message */}
            {error && !loading && !scanResult && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
