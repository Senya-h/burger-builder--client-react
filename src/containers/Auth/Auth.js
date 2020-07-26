import React, {useState, useEffect} from 'react';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button'
import classes from './Auth.module.css';
import * as actions from '../../store/actions/index';
import {connect} from 'react-redux';
import Spinner from '../../components/UI/Spinner/Spinner';
import {Redirect} from 'react-router-dom';
import {updateObject, checkValidity} from '../../shared/utility';

const Auth = (props) => {
    const [authForm, setAuthForm] = useState({
        email: {
            elementType: 'input',
            elementConfig: {
                type: 'email',
                placeholder: "EMail Address"
            },
            value: '',
            validation: {
                required: true,
                isEmail: true
            },
            valid: false,
            touched: false
        },
        password: {
            elementType: 'input',
            elementConfig: {
                type: 'password',
                placeholder: "Password"
            },
            value: '',
            validation: {
                required: true,
                minLength: 8
            },
            valid: false,
            touched: false
        }
    });

    const [isSignup, setIsSignup] = useState(true);


    const inputChangedHandler = (event, controlName) => {

        const updatedControls = updateObject(authForm, {
            [controlName]: updateObject(...authForm[controlName], {
                value: event.target.value,
                valid: checkValidity(event.target.value, authForm[controlName].validation),
                touched: true
            })
        })
        setAuthForm(updatedControls);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        props.onAuth(authForm.email.value, authForm.password.value, isSignup);
    }

    const switchAuthModeHandler = () => {
        setIsSignup(prevState => !prevState.isSignup);
    }

    useEffect(() => {
        if(!props.building && props.authRedirectPath !== '/') {
            props.setAuthRedirectPath('/');
        }
    }, [])


    if(props.isAuth) {
        return <Redirect to={props.authRedirectPath} />
    }

    const formElementsArray = [];
    for (let key in authForm) {
        formElementsArray.push({
            id: key,
            config: authForm[key]
        })
    }

    let form = formElementsArray.map(formElement => (
        <Input
            key={formElement.id} 
            elementType={formElement.config.elementType} 
            elementConfig={formElement.config.elementConfig} 
            value={formElement.config.value}
            changed={(e) => inputChangedHandler(e, formElement.id)}
            invalid={!formElement.config.valid}
            touched={formElement.config.touched}
            shouldValidate={formElement.config.validation}
        />
    ))
    
    if(props.loading) {
        form = <Spinner />
    }

    let errorMessage = null;

    if(props.error) {
        errorMessage = (
            <p>{props.error.message}</p>
        )
    }
    return (
        <div className={classes.Auth}>
            {errorMessage}
            <form onSubmit={submitHandler}>
                {form}
                <Button btnType="Success">Submit</Button> 
            </form>
            <Button clicked={switchAuthModeHandler} btnType="Danger">Switch to {isSignup? "Sign In": "Sign Up"}</Button>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuth: state.auth.token !== null,
        building: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup)),
        onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);