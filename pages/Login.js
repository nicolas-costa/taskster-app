import React from 'react';
import { StyleSheet, Text, View, AsyncStorage, Alert, Image } from 'react-native';
import { Button }  from "react-native-material-ui";
import { TextField } from 'react-native-material-textfield';
import { StackActions, NavigationActions } from 'react-navigation';


const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'TasksMain' })],
});

class Login extends React.Component {

    constructor(props){
       super(props);
        this.state = {login: '',
            pass: ''}
    }

    static navigationOptions = {
        headerTransparent: true,
    };

    render() {

        AsyncStorage.getItem('token').then((token) => {
            if(token !== undefined)
                this.props.navigation.dispatch(resetAction)

        });

        return (

            <View style={styles.container}>
                <Image
                    style={styles.logo}
                    source={require("./assets/images/taskster.png")}/>

                <TextField
                    label={'Login'}
                    keyboardType={'email-address'}
                    onChangeText={(text) => this.setState({login: text})}
                />

                <TextField
                    containerStyle={{marginBottom: 20}}
                    label={'Senha:'}
                    secureTextEntry={true}
                    onChangeText={(text) => this.setState({pass: text})}
                />

                <Button
                    onPress={this.logIn}
                    raised
                    text="Entrar"
                    primary
                />

            </View>
        );
    }

    logIn = () => {

        if(this.state.user === '' || this.state.pass === '') {
            Alert.alert('Erro', 'Usuário e/ou senha são obrigatórios');
            return
        }

        let body = JSON.stringify({
            user: this.state.login,
            pass: this.state.pass
        });

        fetch('https://taskster-api.herokuapp.com/api/v1/login',{
            method:'PATCH',
            headers:{
                'Content-Type':'application/json'
            },
            body: body
        })
        .then(response =>
        {
            let res = JSON.parse(response._bodyText);
            if(response.status === '404')
                Alert.alert('Erro', 'Sua versão está desatualizada');

            else if(res.status === 'Account not found')
                Alert.alert('Erro', 'Conta não encontrada')

            else if(res.status === 'Invalid Credentials')
                Alert.alert('Erro', 'Usuário ou senha inválidos')
            else if(res.success === true && typeof res.status === 'string')
            {
                AsyncStorage.setItem('token', res.status, () => {
                    // Open home
                    this.props.navigation.dispatch(resetAction)

                });

            }

        })
        .catch(error =>
        {
            console.log('error', error)
            let ret = JSON.parse(error);
            Alert.alert('error', ret);
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding:50,
    },
    welcome: {
        fontSize: 25,
        textAlign: 'center',
        margin: 10,
    },
    logo: {
        alignSelf: 'center',
    }

});

export default Login;