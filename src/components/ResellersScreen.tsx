import { useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Phone, Star, MessageCircle } from "lucide-react";

interface ResellersScreenProps {
  onBack: () => void;
  rechargeAmount?: number;
  userPhoneNumber?: string;
  playBalance?: number;
  onRecharge?: () => void;
  onProfile?: () => void;
}

interface Reseller {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flagUrl: string;
  rating: number;
  votes: number;
  phone: string;
  whatsapp: string;
}

const RESELLERS: Reseller[] = [
  {
    id: "1",
    name: "GREGOIRE RT SERVICE",
    country: "Togo",
    countryCode: "tg",
    flagUrl: "https://flagcdn.com/tg.svg",
    rating: 4.8,
    votes: 264,
    phone: "+228 90 12 34 56",
    whatsapp: "+22890123456",
  },
  {
    id: "2",
    name: "AKOSSIWA LOTO CENTER",
    country: "Togo",
    countryCode: "tg",
    flagUrl: "https://flagcdn.com/tg.svg",
    rating: 4.9,
    votes: 187,
    phone: "+228 91 23 45 67",
    whatsapp: "+22891234567",
  },
  {
    id: "3",
    name: "MAISON DU LOTO COTONOU",
    country: "Bénin",
    countryCode: "bj",
    flagUrl: "https://flagcdn.com/bj.svg",
    rating: 4.7,
    votes: 312,
    phone: "+229 97 12 34 56",
    whatsapp: "+22997123456",
  },
  {
    id: "4",
    name: "CHANCE PLUS ABIDJAN",
    country: "Côte d'Ivoire",
    countryCode: "ci",
    flagUrl: "https://flagcdn.com/ci.svg",
    rating: 4.6,
    votes: 428,
    phone: "+225 07 12 34 56 78",
    whatsapp: "+2250712345678",
  },
  {
    id: "5",
    name: "KOKOU DISTRIBUTEUR LOMÉ",
    country: "Togo",
    countryCode: "tg",
    flagUrl: "https://flagcdn.com/tg.svg",
    rating: 4.5,
    votes: 156,
    phone: "+228 92 34 56 78",
    whatsapp: "+22892345678",
  },
  {
    id: "6",
    name: "SUPER CHANCE PORTO-NOVO",
    country: "Bénin",
    countryCode: "bj",
    flagUrl: "https://flagcdn.com/bj.svg",
    rating: 4.8,
    votes: 203,
    phone: "+229 96 23 45 67",
    whatsapp: "+22996234567",
  },
  {
    id: "7",
    name: "GOLDEN LOTO ACCRA",
    country: "Ghana",
    countryCode: "gh",
    flagUrl: "https://flagcdn.com/gh.svg",
    rating: 4.7,
    votes: 389,
    phone: "+233 24 123 4567",
    whatsapp: "+233241234567",
  },
  {
    id: "8",
    name: "MEGA CHANCE OUAGA",
    country: "Burkina Faso",
    countryCode: "bf",
    flagUrl: "https://flagcdn.com/bf.svg",
    rating: 4.6,
    votes: 274,
    phone: "+226 70 12 34 56",
    whatsapp: "+22670123456",
  },
  {
    id: "9",
    name: "DAKAR LOTO EXPRESS",
    country: "Sénégal",
    countryCode: "sn",
    flagUrl: "https://flagcdn.com/sn.svg",
    rating: 4.9,
    votes: 521,
    phone: "+221 77 123 45 67",
    whatsapp: "+221771234567",
  },
];

const COUNTRIES = [
  { code: "all", name: "Tous", flagUrl: "" },
  { code: "tg", name: "Togo", flagUrl: "https://flagcdn.com/tg.svg" },
  { code: "bj", name: "Bénin", flagUrl: "https://flagcdn.com/bj.svg" },
  { code: "ci", name: "Côte d'Ivoire", flagUrl: "https://flagcdn.com/ci.svg" },
  { code: "gh", name: "Ghana", flagUrl: "https://flagcdn.com/gh.svg" },
  { code: "bf", name: "Burkina Faso", flagUrl: "https://flagcdn.com/bf.svg" },
  { code: "sn", name: "Sénégal", flagUrl: "https://flagcdn.com/sn.svg" },
];

export function ResellersScreen({ onBack, rechargeAmount, userPhoneNumber = "+228 90 12 34 56", playBalance, onRecharge, onProfile }: ResellersScreenProps) {
  const [selectedCountry, setSelectedCountry] = useState("all");

  const filteredResellers = selectedCountry === "all" 
    ? RESELLERS 
    : RESELLERS.filter(r => r.countryCode === selectedCountry);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (whatsapp: string) => {
    // Construire le message pré-rempli
    let message = "Bonjour, je suis un utilisateur de Lotto Happy. ";
    
    if (rechargeAmount) {
      message += `Je souhaite recharger mon compte du montant de ${rechargeAmount.toLocaleString('fr-FR')} F CFA. `;
    }
    
    message += `Mon numéro de compte Lotto Happy est le ${userPhoneNumber}.`;
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Ouvrir WhatsApp avec le message pré-rempli
    window.open(`https://wa.me/${whatsapp}?text=${encodedMessage}`, '_blank');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating)
                ? "fill-[#FFD700] text-[#FFD700]"
                : star - 0.5 <= rating
                ? "fill-[#FFD700]/50 text-[#FFD700]"
                : "text-muted"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header balance={playBalance} onRecharge={onRecharge} onProfile={onProfile} />

      <main className="container px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-accent/10"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Revendeurs Agréés</h1>
          <p className="text-muted-foreground">
            Contactez nos partenaires de confiance pour recharger votre compte
          </p>
        </div>

        {/* Country Filters */}
        <div className="mb-8 overflow-x-auto scrollbar-visible">
          <div className="flex gap-2 pb-2">
            {COUNTRIES.map((country) => (
              <Button
                key={country.code}
                variant={selectedCountry === country.code ? "default" : "outline"}
                className={
                  selectedCountry === country.code
                    ? "bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90 whitespace-nowrap"
                    : "border-border hover:border-[#FFD700] hover:bg-[#FFD700]/10 whitespace-nowrap"
                }
                onClick={() => setSelectedCountry(country.code)}
              >
                {country.flagUrl && (
                  <img src={country.flagUrl} alt={country.name} className="mr-2 h-4 w-6 object-cover rounded-sm" />
                )}
                {country.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Resellers List */}
        <div className="space-y-4 mb-8">
          {filteredResellers.length > 0 ? (
            filteredResellers.map((reseller) => (
              <Card key={reseller.id} className="border-border bg-card p-5 hover:border-[#FFD700]/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info Section */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground">{reseller.name}</h3>
                      <Badge variant="outline" className="border-border">
                        <img 
                          src={reseller.flagUrl} 
                          alt={reseller.country} 
                          className="mr-1 h-3 w-4 object-cover rounded-sm" 
                        />
                        {reseller.country}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {renderStars(reseller.rating)}
                      <span className="text-sm text-muted-foreground">
                        ({reseller.votes} votes)
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none border-[#34C759] text-[#34C759] hover:bg-[#34C759]/10"
                      onClick={() => handleCall(reseller.phone)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Appeler</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                      onClick={() => handleWhatsApp(reseller.whatsapp)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Aucun revendeur trouvé pour ce pays
              </p>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-[#FFD700] bg-[#FFD700]/10 p-6">
          <h3 className="font-semibold text-foreground mb-3">
            💡 Comment ça marche ?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1️⃣ Choisissez un revendeur agréé de votre pays</li>
            <li>2️⃣ Contactez-le par téléphone ou WhatsApp</li>
            <li>3️⃣ Effectuez votre paiement via Mobile Money</li>
            <li>4️⃣ Votre compte sera crédité instantanément !</li>
          </ul>
        </Card>
      </main>

      <Footer />
    </div>
  );
}