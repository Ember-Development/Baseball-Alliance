// // src/components/ui/CheckoutModal.tsx
// import React, { useMemo, useState } from "react";
// import type { EventPublic } from "../../lib/event";
// import { api } from "../../lib/api";
// import { useAuth } from "../../context/AuthContext";

// const ACCEPT_HOSTED_ENABLED =
//   (import.meta.env.VITE_ACCEPT_HOSTED_ENABLED ?? "false").toString() === "true";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   event: EventPublic | null;
//   registrationId: string | null;
//   amountCents: number;
//   onLaunchedPayment?: (paymentId: string) => void;
// };

// export default function CheckoutModal({
//   open,
//   onClose,
//   event,
//   registrationId,
//   amountCents,
//   onLaunchedPayment,
// }: Props) {
//   const { user } = useAuth();
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const canSubmit = useMemo(() => {
//     if (!event) return false;
//     if (!registrationId) return false;
//     if (!amountCents || amountCents <= 0) return false;
//     return true;
//   }, [event, registrationId, amountCents]);

//   const priceStr = useMemo(
//     () =>
//       (amountCents / 100).toLocaleString(undefined, {
//         style: "currency",
//         currency: "USD",
//       }),
//     [amountCents]
//   );

//   if (!open) return null;

//   async function handlePay(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);

//     if (!user) {
//       setError("Please log in to continue.");
//       return;
//     }
//     if (!canSubmit) return;

//     setSubmitting(true);
//     try {
//       const { token, url, paymentId } = await api.createAcceptHostedSession(
//         registrationId!,
//         amountCents
//       );

//       localStorage.setItem("lastPaymentId", paymentId);
//       onLaunchedPayment?.(paymentId);

//       if (!ACCEPT_HOSTED_ENABLED) {
//         setSubmitting(false);
//         setError(
//           "Payments are not enabled yet—your registration is saved as Pending."
//         );
//         return;
//       }
//       window.location.href = `${url}?token=${encodeURIComponent(token)}`;
//     } catch (err: any) {
//       setError(err?.message ?? "Failed to start checkout.");
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-white/80 backdrop-blur-xl shadow-xl">
//         {/* Header */}
//         <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between">
//           <h3 className="text-lg font-extrabold text-[#163968]">Checkout</h3>
//           <button
//             onClick={onClose}
//             aria-label="Close"
//             className="h-9 w-9 rounded-full border border-black/10 text-[#163968] bg-white hover:bg-black/5"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Body */}
//         <form onSubmit={handlePay} className="px-5 py-4 space-y-4">
//           {!user && (
//             <div className="text-sm text-red-600">
//               You must be logged in to continue.
//             </div>
//           )}

//           {!event ? (
//             <div className="text-sm text-black/70">No event selected.</div>
//           ) : (
//             <>
//               <div className="rounded-xl border border-black/10 bg-white/70 p-3">
//                 <div className="flex items-baseline justify-between gap-3">
//                   <div>
//                     <div className="text-sm text-black/60">Event</div>
//                     <div className="font-semibold text-[#163968]">
//                       {event.title}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm text-black/60">Type</div>
//                     <div className="font-semibold text-[#163968]">
//                       {event.type}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
//                   <div className="rounded-lg bg-black/5 p-2">
//                     <div className="text-black/60">When</div>
//                     <div className="font-medium text-[#163968]">
//                       {formatWhen(event)}
//                     </div>
//                   </div>
//                   <div className="rounded-lg bg-black/5 p-2">
//                     <div className="text-black/60">Where</div>
//                     <div className="font-medium text-[#163968]">
//                       {event.venue
//                         ? `${event.venue} • ${event.city}, ${event.state}`
//                         : `${event.city}, ${event.state}`}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="rounded-xl border border-black/10 bg-white/70 p-3">
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-black/60">Price</div>
//                   <div className="text-lg font-extrabold text-[#163968]">
//                     {priceStr}
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {error && (
//             <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
//               {error}
//             </div>
//           )}

//           <div className="flex items-center justify-between">
//             <button
//               type="button"
//               onClick={onClose}
//               className="h-10 px-4 rounded-lg border border-black/15 bg-white hover:bg-black/5 text-[#163968] font-semibold"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={!canSubmit || submitting}
//               className={`h-10 px-4 rounded-lg font-semibold text-white transition ${
//                 !canSubmit || submitting
//                   ? "bg-[#163968]/60"
//                   : "bg-[#163968] hover:brightness-110"
//               }`}
//             >
//               {submitting ? "Starting Checkout…" : "Continue to Payment"}
//             </button>
//           </div>

//           {!ACCEPT_HOSTED_ENABLED && (
//             <p className="text-xs text-black/50">
//               Payments are not yet enabled in this environment.
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// }

// function formatWhen(e: EventPublic) {
//   const d = new Date(e.startDate);
//   const date = d.toLocaleDateString(undefined, {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
//   const t = e.startTime ? ` • ${e.startTime}` : "";
//   return `${date}${t}`;
// }
