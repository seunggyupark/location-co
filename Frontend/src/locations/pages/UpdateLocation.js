import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import axiosLocations from '../../shared/axios/axios-locations';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import { useForm } from '../../shared/hooks/form-hook';
import {VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH} from '../../shared/util/validators';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './LocationForm.css';

const UpdatePlace = () => {
    const locationId = useParams().locationId;
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [identifiedLocation, setIdentifiedLocation] = useState();
    const history = useHistory();
    const auth = useContext(AuthContext);

    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        }
    }, false);

    useEffect(() => {
        (async function() {
            try {
                const responseData = await sendRequest(axiosLocations, `${locationId}`);
                setIdentifiedLocation(responseData.location);
                setFormData({
                    title: {
                        value: responseData.location.title,
                        isValid: true
                    },
                    description: {
                        value: responseData.location.description,
                        isValid: true
                    }
                }, true);
            } catch(err) {}
        })();
    }, [setFormData, sendRequest, locationId]);
    

    const locationUpdateSubmitHandler = async event => {
        event.preventDefault();

        const postData = JSON.stringify({
            title: formState.inputs.title.value,
            description: formState.inputs.description.value
        });

        try {
            await sendRequest(
                axiosLocations,
                `${locationId}`,
                'PATCH',
                postData,
                {Authorization: `Bearer ${auth.token}`}
            );
            history.push(`/${auth.userId}/locations`);
        } catch(err) {}
    };

    if (!identifiedLocation && error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find that location!</h2>
                </Card>
            </div>
        );
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {identifiedLocation && !isLoading &&
            (<form className="place-form" onSubmit={locationUpdateSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay />}
                <Input 
                    id="title" 
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title."
                    onInput={inputHandler}
                    value={identifiedLocation.title}
                    valid={true}
                />
                <Input 
                    id="description" 
                    element="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (at least 5 characters)."
                    onInput={inputHandler}
                    value={identifiedLocation.description}
                    valid={true}
                />
                <Button type="submit" disabled={!formState.isValid}>Update Location</Button>
            </form>)}
        </React.Fragment>
    );
};

export default UpdatePlace;