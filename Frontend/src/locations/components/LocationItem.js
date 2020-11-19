import React, { useState, useContext } from 'react';

import axiosLocations from '../../shared/axios/axios-locations';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Map from '../../shared/components/UIElements/Map';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './LocationItem.css';

const LocationItem = props => {
    const auth = useContext(AuthContext);

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [showMap, setShowMap] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const openMapHandler = () => setShowMap(true);
    const closeMapHandler = () => setShowMap(false);

    const openDeleteModalHandler = () => setShowDeleteModal(true);
    const closeDeleteModalHandler = () => setShowDeleteModal(false);

    const confirmDeleteHandler = async () => {
        setShowDeleteModal(false);
        try {
            await sendRequest(
                axiosLocations,
                `${props.id}`,
                'DELETE',
                null,
                {Authorization: `Bearer ${auth.token}`}
            );
            props.onDelete(props.id);
        } catch(err) {};
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <Modal 
                show={showMap} 
                onCancel={closeMapHandler} 
                header={props.address} 
                contentClass="place-item__modal-content"
                footerClass="place-item__modal-actions"
                footer={<Button onClick={closeMapHandler}>Close</Button>}>
                <div className="map-container">
                    <Map center={props.coordinates} zoom={16} />
                </div>
            </Modal>
            <Modal
                show={showDeleteModal} 
                header="Are you sure?" 
                footerClass="place-item__modal-actions"
                footer={<React.Fragment>
                            <Button inverse onClick={closeDeleteModalHandler}>Cancel</Button>
                            <Button danger onClick={confirmDeleteHandler}>Delete</Button>
                        </React.Fragment>}
            >
                <p>Do you want to delete this location? This cannot be undone.</p>
            </Modal>
            <li className="place-item">
                <Card className="place-item__content">
                    {isLoading && <LoadingSpinner asOverlay />}
                    <div className="place-item__image">
                        <img src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt={props.title} />
                    </div>
                    <div className="place-item__info">
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className="place-item__actions">
                        <Button inverse onClick={openMapHandler}>View on Map</Button>
                        {auth.userId === props.creatorId && (<Button to={`/locations/${props.id}`}>Edit</Button>)}
                        {auth.userId === props.creatorId && (<Button danger onClick={openDeleteModalHandler}>Delete</Button>)}
                    </div>
                </Card>
            </li>  
        </React.Fragment>
    );
};

export default LocationItem;