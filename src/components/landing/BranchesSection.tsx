import { MapPin, Phone, Clock } from "lucide-react";

const branches = [
  {
    name: "AURA City Center",
    address: "123 Sports Avenue, Downtown",
    phone: "+965 2200 1001",
    hours: "Sat–Thu: 6:00 AM – 10:00 PM",
  },
  {
    name: "AURA Al-Rasheed",
    address: "Block 5, Street 12, Al-Rasheed",
    phone: "+965 2200 1002",
    hours: "Sat–Thu: 6:00 AM – 10:00 PM",
  },
  {
    name: "AURA South Hub",
    address: "Villa 45, South Suburb, Block 8",
    phone: "+965 2200 1003",
    hours: "Sat–Thu: 7:00 AM – 9:00 PM",
  },
  {
    name: "AURA Sports Village",
    address: "Olympic Road, Sports City",
    phone: "+965 2200 1004",
    hours: "Sat–Thu: 5:00 AM – 11:00 PM",
  },
  {
    name: "AURA Al-Salmiya",
    address: "Coastal Road, Al-Salmiya Area",
    phone: "+965 2200 1005",
    hours: "Sat–Thu: 6:00 AM – 10:00 PM",
  },
];

export default function BranchesSection() {
  return (
    <section id="branches" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Branches</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Find the branch closest to you and start your journey today.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.name}
              className="card-athletic rounded-xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-3">{branch.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{branch.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
