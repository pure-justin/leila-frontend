"use strict";
/**
 * Firestore Data Models
 *
 * This file contains all TypeScript interfaces and enums for Firestore collections.
 * These models are shared between the frontend, CRM, and API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayOfWeek = exports.NotificationPreference = exports.VerificationStatus = exports.ContractorTier = exports.PaymentMethod = exports.PaymentStatus = exports.BookingStatus = exports.ServiceCategory = exports.UserStatus = exports.UserRole = void 0;
// ============= ENUMS =============
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["CONTRACTOR"] = "CONTRACTOR";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var ServiceCategory;
(function (ServiceCategory) {
    ServiceCategory["PLUMBING"] = "PLUMBING";
    ServiceCategory["ELECTRICAL"] = "ELECTRICAL";
    ServiceCategory["HVAC"] = "HVAC";
    ServiceCategory["CLEANING"] = "CLEANING";
    ServiceCategory["HANDYMAN"] = "HANDYMAN";
    ServiceCategory["PAINTING"] = "PAINTING";
    ServiceCategory["GARDENING"] = "GARDENING";
    ServiceCategory["PEST_CONTROL"] = "PEST_CONTROL";
    ServiceCategory["APPLIANCE_REPAIR"] = "APPLIANCE_REPAIR";
    ServiceCategory["CARPENTRY"] = "CARPENTRY";
    ServiceCategory["ROOFING"] = "ROOFING";
    ServiceCategory["FLOORING"] = "FLOORING";
})(ServiceCategory || (exports.ServiceCategory = ServiceCategory = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["DRAFT"] = "DRAFT";
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["ASSIGNED"] = "ASSIGNED";
    BookingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["DISPUTED"] = "DISPUTED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["APPLE_PAY"] = "APPLE_PAY";
    PaymentMethod["GOOGLE_PAY"] = "GOOGLE_PAY";
    PaymentMethod["PAYPAL"] = "PAYPAL";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ContractorTier;
(function (ContractorTier) {
    ContractorTier["BRONZE"] = "BRONZE";
    ContractorTier["SILVER"] = "SILVER";
    ContractorTier["GOLD"] = "GOLD";
    ContractorTier["PLATINUM"] = "PLATINUM";
})(ContractorTier || (exports.ContractorTier = ContractorTier = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["NOT_STARTED"] = "NOT_STARTED";
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["EXPIRED"] = "EXPIRED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var NotificationPreference;
(function (NotificationPreference) {
    NotificationPreference["EMAIL"] = "EMAIL";
    NotificationPreference["SMS"] = "SMS";
    NotificationPreference["PUSH"] = "PUSH";
    NotificationPreference["IN_APP"] = "IN_APP";
})(NotificationPreference || (exports.NotificationPreference = NotificationPreference = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
//# sourceMappingURL=firestore-models.js.map