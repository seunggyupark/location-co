import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
    const auth = useContext(AuthContext);

    return (
    <ul className="nav-links">
        <li>
            <NavLink to ="/" exact>All Users</NavLink>
        </li>
        {auth.isLoggedIn && (<li>
            <NavLink to ={`/${auth.userId}/locations`}>Saved Locations</NavLink>
        </li>)}
        {auth.isLoggedIn && (<li>
            <NavLink to ="/locations/new">Add Location</NavLink>
        </li>)}
        {!auth.isLoggedIn && (<li>
            <NavLink to ="/auth">Sign In</NavLink>
        </li>)}
        {auth.isLoggedIn && (<li>
            <button onClick={auth.logout}>Logout</button>
        </li>)}
    </ul>
    );
};

export default NavLinks;