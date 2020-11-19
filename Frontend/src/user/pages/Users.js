import React, { useEffect, useState } from 'react';
import axiosUsers from '../../shared/axios/axios-users';

import { useHttpClient } from '../../shared/hooks/http-hook';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const Users = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState();

    useEffect(() => {
        (async function () {
            try {
                const responseData = await sendRequest(axiosUsers);
                setLoadedUsers(responseData.users);
            } catch(err) {
            }
        })();
    }, [sendRequest]);


    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (<div className="center"><LoadingSpinner /></div>)}
            {!isLoading && loadedUsers && <UsersList items={loadedUsers}/>}
        </React.Fragment>
    );
};

export default Users;