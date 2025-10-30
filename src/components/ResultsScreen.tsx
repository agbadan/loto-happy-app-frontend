import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, Trophy, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDraws, DrawExtended } from "../utils/draws";
import { getOperatorById } from "../utils/games";

interface ResultsScreenProps {
  onBack: () => void;
}

export function ResultsScreen({ onBack }: ResultsScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [archivedDraws, setArchivedDraws] = useState<DrawExtended[]>([]);

  useEffect(() => {
    // Charger tous les tirages complétés
    const draws = getDraws();
    const archived = draws.filter(d => d.status === 'completed');
    // Trier par date (plus récent en premier)
    archived.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    setArchivedDraws(archived);
  }, []);

  // Filtrer les résultats par date sélectionnée
  const filteredResults = selectedDate
    ? archivedDraws.filter((draw) => {
        const drawDate = new Date(draw.date);
        return (
          drawDate.getDate() === selectedDate.getDate() &&
          drawDate.getMonth() === selectedDate.getMonth() &&
          drawDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header balance={0} onRecharge={() => {}} onProfile={() => {}} />

      <main className="container px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 hover:bg-accent/10" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Résultats des Tirages</h1>
          <p className="text-muted-foreground">
            Consultez les résultats des tirages passés
          </p>
        </div>

        {/* Date Selector */}
        <Card className="mb-8 border-border bg-card p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Sélectionnez une date</h2>
              <p className="text-sm text-muted-foreground">
                Cliquez pour voir les résultats d'une journée spécifique
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[240px] justify-start text-left font-normal border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/5"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#FFD700]" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: fr })
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <Card className="border-border bg-card p-12 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-foreground">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? `Aucun tirage n'a été effectué le ${format(selectedDate, "PPP", { locale: fr })}`
                : "Sélectionnez une date pour voir les résultats"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredResults.map((draw) => {
              const operator = getOperatorById(draw.operatorId);
              if (!operator) return null;

              return (
                <Card key={draw.id} className="border-border bg-card overflow-hidden">
                  {/* Header */}
                  <div 
                    className="p-6 border-b border-border"
                    style={{ 
                      background: `linear-gradient(135deg, ${operator.color}15 0%, transparent 100%)` 
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{operator.icon}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {operator.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {operator.country}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{new Date(draw.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{draw.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winning Numbers */}
                  <div className="p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#FF6B00]/10">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                      Numéros Gagnants
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {draw.winningNumbers?.map((num, index) => (
                        <div
                          key={index}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF6B00] shadow-lg"
                        >
                          <span className="text-xl font-bold text-[#121212]">
                            {num}
                          </span>
                        </div>
                      )) || (
                        <p className="text-muted-foreground">Aucun numéro disponible</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Participants</p>
                      <p className="text-2xl font-bold text-foreground">
                        {draw.participants || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Gagnants</p>
                      <p className="text-2xl font-bold text-green-500">
                        {draw.winners || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Mises</p>
                      <p className="text-2xl font-bold text-foreground">
                        {draw.totalBets?.toLocaleString('fr-FR') || 0} F
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Gains</p>
                      <p className="text-2xl font-bold text-[#FF6B00]">
                        {draw.totalWinnings?.toLocaleString('fr-FR') || 0} F
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* All Results Button */}
        {filteredResults.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(undefined)}
            >
              Voir tous les résultats
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
