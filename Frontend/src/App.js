import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import Users from './user/pages/Users';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { useAuth } from './shared/hooks/auth-hook';
import { AuthContext } from './shared/context/auth-context';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

const NewLocation = React.lazy(() => import('./locations/pages/NewLocation'));
const UserLocations = React.lazy(() => import('./locations/pages/UserLocations'));
const UpdateLocation = React.lazy(() => import('./locations/pages/UpdateLocation'));
const Auth = React.lazy(() => import('./user/pages/Auth'));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact><Users /></Route>
        <Route path="/:userId/locations" exact><UserLocations /></Route>
        <Route path="/locations/new" exact><NewLocation /></Route>
        <Route path="/locations/:locationId"><UpdateLocation /></Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact><Users /></Route>
        <Route path="/:userId/locations" exact><UserLocations /></Route>
        <Route path="/auth"><Auth /></Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider value={{isLoggedIn: !!token, userId, login, logout, token}}>
      <Router>
        <MainNavigation />
        <main>
          <Suspense fallback={<div className="center"><LoadingSpinner/></div>}>{routes}</Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
