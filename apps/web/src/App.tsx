import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { MainNav, Toast } from './components/Chrome';
import { Dock } from './components/Dock';
import { Sheets } from './components/Sheets';
import { AssetsScreen } from './screens/AssetsScreen';
import { EditScreen } from './screens/EditScreen';
import { FillScreen } from './screens/FillScreen';
import { ItemScreen } from './screens/ItemScreen';
import { MapScreen } from './screens/MapScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StarterScreen, WelcomeScreen } from './screens/SetupScreens';
import { SpaceScreen } from './screens/SpaceScreen';
import { useWide } from './useWide';

/** Routes with their own back button; the phone hides the main nav on these. */
const DEEP = ['space', 'item', 'fill', 'edit', 'welcome', 'start'];
/** Routes where the phone hides the find dock, so forms get the whole screen. */
const NO_DOCK = ['item', 'fill', 'edit', 'welcome', 'start', 'assets', 'settings'];

export function App() {
  const wide = useWide();
  const first = useLocation().pathname.split('/')[1] ?? '';

  return (
    <div className="app" data-top={DEEP.includes(first) ? undefined : ''}>
      <div className="stage">
        <Routes>
          <Route path="/" element={<MapScreen />} />
          <Route path="/space/:id" element={<Keyed><SpaceScreen /></Keyed>} />
          <Route path="/item/:id" element={<Keyed><ItemScreen /></Keyed>} />
          <Route path="/fill/:id" element={<Keyed><FillScreen /></Keyed>} />
          <Route path="/edit/:id" element={<Keyed><EditScreen /></Keyed>} />
          <Route path="/assets" element={<AssetsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/start" element={<StarterScreen />} />
          <Route path="*" element={<MapScreen />} />
        </Routes>
      </div>
      {/* Phone: the find dock sits under the map and rooms. Desktop: it is the left rail on every screen. */}
      {(wide || !NO_DOCK.includes(first)) && <Dock />}
      <MainNav />
      <Toast />
      <Sheets />
    </div>
  );
}

/** Remounts on id change so scroll position and local state reset between spaces. */
function Keyed({ children }: { children: JSX.Element }) {
  const { id } = useParams();
  return <div key={id} className="screen">{children}</div>;
}
