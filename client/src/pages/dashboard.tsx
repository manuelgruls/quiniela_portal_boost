import { Code, BarChart, BrainCircuit, Server, Globe, Calendar, MessageCircle, Trophy, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';
import ProtectedLayout from '../components/layout/protected-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Extract first name from full name
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : '';

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8 border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bienvenido(a) {firstName} a Portal BOOST
          </h1>
          <p className="text-muted-foreground text-lg">Tecnología impulsada por Boost. Transformamos datos en experiencias.</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - lg:col-span-2 */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Quiniela Access Card */}
            <Card className="bg-card rounded-2xl border border-white/10">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Quiniela Mundial 2026</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Accede al tablero de predicciones del Mundial y compite con otros participantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setLocation('/dashboard/quiniela')}
                >
                  Ir al Tablero del Mundial
                </Button>
              </CardContent>
            </Card>

            {/* Contact Card - Call to Action */}
            <Card className="bg-card rounded-2xl border border-border">
              <CardHeader>
                <CardTitle className="text-xl">¿Te interesa un proyecto así?</CardTitle>
                <CardDescription>
                  Contáctanos para llevar tu negocio al siguiente nivel con soluciones tecnológicas a la medida.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="https://boost-up.mx" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                    Visitar Sitio Web
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="https://calendly.com/manuelrul-boost-up/30min" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4" />
                    Agendar Cita
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="https://wa.me/3314852779" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - lg:col-span-3 */}
          <div className="lg:col-span-3 h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-stretch">
              {/* Service Card 1: Development */}
              <Card className="bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-primary/40 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)] hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Code className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">Desarrollo a la Medida</CardTitle>
                  <CardDescription>
                    Portales web robustos y escalables adaptados a tus reglas de negocio.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Service Card 2: BI & Data */}
              <Card className="bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-primary/40 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)] hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <BarChart className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">BI & Datos</CardTitle>
                  <CardDescription>
                    Tableros claros para la toma de decisiones y análisis en tiempo real.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Service Card 3: AI & Queries */}
              <Card className="bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-primary/40 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)] hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">IA & Consultas Inteligentes</CardTitle>
                  <CardDescription>
                    Agentes de IA que ejecutan tareas complejas por ti y agilizan la toma de decisiones. Hazle preguntas a tu información y obtén respuestas inmediatas sin tener que leer todos tus documentos.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Service Card 4: Infrastructure */}
              <Card className="bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-primary/40 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)] hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)] hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <CardHeader>
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Server className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary">Infraestructura</CardTitle>
                  <CardDescription>
                    Servidores propios y entornos aislados para garantizar la máxima seguridad y privacidad de tu información.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
