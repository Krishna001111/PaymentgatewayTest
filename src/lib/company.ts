// Company details shown across the site and on documents.
// TODO: replace every placeholder below with AP Auto Parts' real details.
export const company = {
  name: "AP Auto Parts",
  tagline: "Precision-engineered auto components you can rely on",
  description:
    "AP Auto Parts is a manufacturer of quality automotive components, supplying OEMs, dealers and distributors with dependable parts at competitive prices.",
  phone: "+91 98765 43210", // TODO: real phone
  whatsapp: "919876543210", // TODO: real WhatsApp number (country code, digits only)
  email: "sales@apautoparts.example.com", // TODO: real email
  address: "Plot 12, Industrial Area, Phase II", // TODO: real address
  city: "Your City",
  state: "Your State",
  pincode: "000000",
  gstin: "00AAAAA0000A1Z0", // TODO: real GSTIN
  established: "1998", // TODO: real year
};

export function whatsappLink(message: string) {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
}
