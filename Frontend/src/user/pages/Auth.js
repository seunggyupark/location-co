import React, { useState, useContext } from 'react';

import axiosUsers from '../../shared/axios/axios-users';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false);

    const authSubmitHandler = async event => {
        event.preventDefault();

        if (isLoginMode) {
            const postData = JSON.stringify({
                email: formState.inputs.email.value,
                password: formState.inputs.password.value
            });

            try {
                const responseData = await sendRequest(
                    axiosUsers,
                    'login',
                    'POST',
                    postData
                );
                auth.login(responseData.userId, responseData.token);
            } catch(err) {}

        } else {
            const formData = new FormData();
            formData.append('username', formState.inputs.username.value);
            formData.append('email', formState.inputs.email.value);
            formData.append('password', formState.inputs.password.value);
            formData.append('image', formState.inputs.image.value);

            try {
                const responseData = await sendRequest(
                    axiosUsers,
                    'signup',
                    'POST',
                    formData
                );
                auth.login(responseData.userId, responseData.token);
            } catch(err) {}
        };
    };

    const switchModeHandler = event => {
        event.preventDefault();
        if (!isLoginMode) {
            setFormData({
                ...formState.inputs,
                username: undefined,
                image: undefined,
            }, formState.inputs.email.isValid && formState.inputs.password.isValid);
        } else {
            setFormData({
                ...formState.inputs,
                username: {
                    value: '',
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false);
        };
        setIsLoginMode(prevMode => !prevMode)
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                <h2>Login Required</h2>
                <hr />
                <form onSubmit={authSubmitHandler}>
                    {!isLoginMode &&
                    <Input 
                        id="username"
                        type="text"
                        label="Username"
                        element="input"
                        errorText="Please enter a valid username."
                        value={formState.inputs.username.value}
                        onInput={inputHandler}
                        validators={[VALIDATOR_REQUIRE()]}
                    />}
                    {!isLoginMode && <ImageUpload id="image" center onInput={inputHandler} errorText="Please provide an image."/>}
                    <Input 
                        id="email"
                        type="email"
                        label="Email"
                        element="input"
                        errorText="Please enter a valid email."
                        value={formState.inputs.email.value}
                        onInput={inputHandler}
                        validators={[VALIDATOR_EMAIL()]}
                    />
                    <Input 
                        id="password"
                        type="password"
                        label="Password"
                        element="input"
                        errorText="Please enter a valid password (minimum length 8)."
                        value={formState.inputs.password.value}
                        onInput={inputHandler}
                        validators={[VALIDATOR_MINLENGTH(8)]}
                    />
                    <Button type="submit" disabled={!formState.isValid}>{isLoginMode ? "Log In" : "Signup"}</Button>
                    <Button inverse onClick={switchModeHandler}>Switch to {isLoginMode ? "Signup" : "Log In"}</Button>
                </form>
            </Card>
        </React.Fragment>
    );
}

export default Auth;