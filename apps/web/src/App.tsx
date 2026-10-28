import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { MainNav, Toast } from './components/Chrome';
import { Sheets } from './components/Sheets';
import { ItemScreen } from './screens/ItemScreen';
import { MapScreen } from './screens/MapScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SpaceScreen } from './screens/SpaceScreen';
import { useStore } from './store';

export function App() {
  const { data, openAdd } = useStore();
  const { pathname } = useLocation();

  // The Add tab drops new items where the user is looking.
  const onAdd = () => {
    const [, kind, id] = pathname.split('/');
    if (kind === 'space' && id) return openAdd({ space: id });
    if (kind === 'item' && id) return openAdd({ space: data.items.find(i => i.id === id)?.space });
    openAdd();
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MapScreen />} />
        <Route path="/space/:id" element={<Keyed><SpaceScreen /></Keyed>} />
        <Route path="/item/:id" element={<Keyed><ItemScreen /></Keyed>} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<MapScreen />} />
      </Routes>
      <MainNav onAdd={onAdd} />
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
