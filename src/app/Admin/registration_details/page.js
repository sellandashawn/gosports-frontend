"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Download,
  X,
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
  Users,
} from "lucide-react";
import { getEventParticipants } from "../../api/participant";

export default function RegistrationsDetails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [userdata, setUserData] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getEventParticipants();
      if (response && response.data) {
        setUserData(response.data.participants || []);
        console.log("Fetched Participants:", response.data.participants);
      }
    };

    fetchUsers();
  }, []);

  const filteredRegistrations = userdata.filter((registration) => {
    const billingName = `${registration.billingInfo?.firstName || ""} ${
      registration.billingInfo?.lastName || ""
    }`.toLowerCase();
    const billingEmail = registration.billingInfo?.email?.toLowerCase() || "";
    const billingPhone = registration.billingInfo?.phone?.toLowerCase() || "";
    const searchText = `${billingName} ${billingEmail} ${billingPhone}`;
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const currentPageRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "successful":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewAttendee = (registration) => {
    setSelectedRegistration(registration);
    setShowAttendeeModal(true);
  };

  const handleCloseModal = () => {
    setShowAttendeeModal(false);
    setSelectedRegistration(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent mb-2">
              Registrations Details
            </h1>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-4 items-center mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone number..."
                className="text-black w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-primary/90 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all hover:bg-primary/80">
                <Eye size={20} />
                Preview
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-primary/90 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all hover:bg-primary/80">
                <Download size={20} />
                Download
              </button>
            </div> */}
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Phone no
                </th>
                {/* <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Gender
                </th> */}
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Tickets Booked
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentPageRegistrations.map((registration, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4  text-slate-700">
                    {registration.billingInfo?.firstName +
                      " " +
                      registration.billingInfo?.lastName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {registration.billingInfo?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {registration.billingInfo?.phone || "N/A"}
                  </td>
                  {/* <td className="px-6 py-4 text-slate-700">
                    {registration.attendeeInfo?.gender
                      ? registration.attendeeInfo.gender
                          .charAt(0)
                          .toUpperCase() +
                        registration.attendeeInfo.gender.slice(1)
                      : "N/A"}
                  </td> */}
                  <td className="px-6 py-4 text-slate-700">
                    {registration.numberOfTickets || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        registration.paymentStatus
                      )}`}
                    >
                      {(registration.paymentStatus || "Unknown")
                        .charAt(0)
                        .toUpperCase() +
                        (registration.paymentStatus || "Unknown")
                          .slice(1)
                          .toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewAttendee(registration)}
                      className="p-2 text-slate-400 hover:text-primary/90 hover:bg-primary/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
          >
            Previous
          </button>
          <span className="text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
          >
            Next
          </button>
        </div>
      </div>
      {/* Attendee Info Modal */}
      {showAttendeeModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Registration Details
                </h2>
                <p className="text-slate-600 mt-1">
                  Order ID: {selectedRegistration.orderId || "N/A"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Billing Information */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <User className="text-primary" size={20} />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Billing Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Full Name</p>
                      <p className="text-slate-800 font-medium">
                        {selectedRegistration.billingInfo?.firstName || "N/A"}{" "}
                        {selectedRegistration.billingInfo?.lastName || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        <p className="text-slate-800 font-medium">
                          {selectedRegistration.billingInfo?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Phone</p>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-slate-400" />
                        <p className="text-slate-800 font-medium">
                          {selectedRegistration.billingInfo?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">
                        Registration Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <p className="text-slate-800 font-medium">
                          {selectedRegistration.createdAt
                            ? new Date(
                                selectedRegistration.createdAt
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="text-primary" size={20} />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Ticket Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {selectedRegistration.numberOfTickets || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">
                      Scanned Tickets
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {selectedRegistration.scannedTickets || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">
                      Payment Status
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedRegistration.paymentStatus
                      )}`}
                    >
                      {(selectedRegistration.paymentStatus || "Unknown")
                        .charAt(0)
                        .toUpperCase() +
                        (selectedRegistration.paymentStatus || "Unknown")
                          .slice(1)
                          .toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendees Information */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary" size={20} />
                    <h3 className="text-lg font-semibold text-slate-700">
                      Attendees (
                      {selectedRegistration.attendeeInfo?.length || 0})
                    </h3>
                  </div>
                </div>

                {selectedRegistration.attendeeInfo &&
                selectedRegistration.attendeeInfo.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRegistration.attendeeInfo.map(
                      (attendee, index) => (
                        <div
                          key={attendee._id || index}
                          className="bg-slate-50 p-4 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                                <span className="text-primary font-semibold">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">
                                  {attendee.name}
                                </h4>
                                <p className="text-sm text-slate-500">
                                  Ticket:{" "}
                                  {selectedRegistration.ticketNumbers?.[
                                    index
                                  ] || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedRegistration.scannedStatus?.[index]
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {selectedRegistration.scannedStatus?.[index]
                                ? "Scanned"
                                : "Not Scanned"}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Gender
                              </p>
                              <p className="text-slate-700 font-medium capitalize">
                                {attendee.gender || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Age</p>
                              <p className="text-slate-700 font-medium">
                                {attendee.age || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                ID Number
                              </p>
                              <p className="text-slate-700 font-medium">
                                {attendee.identificationNumber || "N/A"}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs text-slate-500 mb-1">
                                Email
                              </p>
                              <p className="text-slate-700 font-medium">
                                {attendee.emailAddress || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Team Name
                              </p>
                              <p className="text-slate-700 font-medium">
                                {attendee.teamName || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-xl text-center">
                    <p className="text-slate-500 italic">
                      No attendee information available
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
