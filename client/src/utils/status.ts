export function statusLabelSR(status: string) {
  switch (status) {
    case "PLANNED":
      return "Nije počeo";
    case "IN_PROGRESS":
      return "U toku";
    case "FINISHED":
      return "Završen";
    case "CANCELLED":
      return "Otkazan";
    case "REJECTED":
      return "Odbijen";
    case "PENDING":
      return "Na čekanju";
    case "APPROVED":
      return "Odobren";
    default:
      return status;
  }
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "PLANNED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "FINISHED":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
