import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import axiosLocations from '../../shared/axios/axios-locations';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import LocationList from '../components/LocationList';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserLocations = () => {
    const userId = useParams().userId;
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [ loadedLocations, setLoadedLocations ] = useState();

    useEffect(() => {
        (async function() {
            try {
                const responseData = await sendRequest(axiosLocations, `user/${userId}`);
                setLoadedLocations(responseData.locations);
            } catch(err) {}
        })();
    }, [sendRequest, userId]);

    const locationDeletedHandler = (deletedLocationId) => {
        setLoadedLocations(prevLocations => prevLocations.filter(location => location.id !== deletedLocationId));
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (<div className="center"><LoadingSpinner /></div>)}
            {!isLoading && loadedLocations && <LocationList items={loadedLocations} onDeleteLocation={locationDeletedHandler} />}
        </React.Fragment>
    );
};

export default UserLocations;