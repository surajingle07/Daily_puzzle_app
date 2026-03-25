import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Heatmap from './components/Heatmap';
import DailyChallenge from './components/DailyChallenge';
import PracticeChallenge from './components/PracticeChallenge';
import LoginScreen from './components/LoginScreen';

function Dashboard() {
  const { user } = useAppContext();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 w-full max-w-full">
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
        <DailyChallenge />
        <PracticeChallenge />
      </div>
      
      <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 px-1 text-lg">
          Activity Timeline
        </h3>
        <Heatmap />
      </div>
    </div>);

}

function App() {
  return (
    <AppProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </AppProvider>);

}

export default App;