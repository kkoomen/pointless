import { useSelector } from 'react-redux';
import Library from '../Library';
import Paper from '../Paper';

function App() {
  const currentRoute = useSelector((state) => state.router.current);
  switch (currentRoute.name) {
    case 'library':
      return <Library />;

    case 'paper':
      return <Paper paperId={currentRoute.args.paperId} />;

    default:
      console.error('Unknown route', currentRoute);
      break;
  }
}

export default App;
