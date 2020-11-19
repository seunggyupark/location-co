import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import LocationItem from './LocationItem';
import Button from '../../shared/components/FormElements/Button';
import './LocationList.css';

const LocationList = props => {
    if (props.items.length === 0) {
        return (
            <div className="place-list center">
                <Card>
                    <h2>No locations found.</h2>
                    <Button to="/locations/new">Share Location</Button>
                </Card>
            </div>
        );
    };

    return (
        <ul className="place-list">
            {props.items.map(location => (
                <LocationItem 
                    key={location.id} 
                    id={location.id}
                    image={location.image}
                    title={location.title}
                    description={location.description}
                    address={location.address}
                    creatorId={location.creator}
                    coordinates={location.location}
                    onDelete={props.onDeleteLocation}
                />
            ))}
        </ul>
    );
};

export default LocationList;