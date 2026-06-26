import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import CRM from "@/pages/CRM";
import People from "@/pages/People";
import Financials from "@/pages/Financials";
import PND from "@/pages/PND";
import RocketPage from "@/pages/Rocket";
import ResourcesManagement from "@/pages/ResourcesManagement";
import Trainings from "@/pages/Trainings";
import Counterproofs from "@/pages/Counterproofs";
import Admin from "@/pages/Admin";
import Calendar from "@/pages/Calendar";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Home} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/crm"} component={CRM} />
      <Route path={"/people"} component={People} />
      <Route path={"/financials"} component={Financials} />
      <Route path={"/pnd"} component={PND} />
      <Route path={"/rocket"} component={RocketPage} />
      <Route path={"/resources"} component={ResourcesManagement} />
      <Route path={"/trainings"} component={Trainings} />
      <Route path={"/counterproofs"} component={Counterproofs} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
