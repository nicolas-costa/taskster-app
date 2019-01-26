import React from 'react';
import Carousel from 'react-native-snap-carousel';
import {Image, View, StyleSheet,
        AsyncStorage, Alert, Text,
        Dimensions, ScrollView } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Button } from 'react-native-material-ui';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Switch } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const leftPadding = 15;

export default class ViewTask extends React.Component {

    constructor(props){
        super(props);

        let _car = null;

        this.state = {
            id:null,
            title:'',
            content:'',
            bk:null,
            done:false,
            schedule:null,
            owner_id:null,
            dpvisible:false,
            scrH:0,
            newItem: false,
            titleErr:'',
            contentErr:'',

        }
    }

    _renderThumb({item, idx})
    {
        return (
            <Image
                style={{width:'100%', height:200,}}
                source={{uri:`https://taskster-api.herokuapp.com/images/default/bk/bk${item.id}.jpg`}}
            />
        );
    }

    _onContentSizeChange = (contentW, contentH) => {

        this.setState({scrH:contentH});
    }

    _onTaskSubmit()
    {

        let errMsg = 'Este campo é obrigatório.';

        let titleErr = '';
        let contentErr = '';

        this.state.title === '' ?  titleErr = errMsg : titleErr = '';
        this.state.content === '' ?  contentErr = errMsg : contentErr = '';

        this.setState({titleErr:titleErr,
                            contentErr:contentErr})

        if(titleErr === '' && contentErr === '')
            this._updateTaskInfo();

    }

    componentDidMount(): void {

        let newItm = this.props.navigation.getParam('new')

        if(newItm === false)
        {
            let id = this.props.navigation.getParam('item_id');

            this._fetchItemData(id);

            this.setState({dpvisible:false});

            // this is a small hax to make the carousel update correctly

            setTimeout(() => {this._car.snapToItem(this.state.bk);}, 500)
        }
        else this.setState({newItem: newItm});

    }
    _fetchItemData(id)
    {

        AsyncStorage.getItem('token')
        .then((token) =>
        {
            fetch(`https://taskster-api.herokuapp.com/api/v1/task/${id}`,
            {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                },

            }).then((result) =>
            {
                let resObj = JSON.parse(result._bodyText).status;

                console.log(resObj)
                this.setState(resObj);


            }).catch((err) => {
                console.log(err);
            })
        });

    }

    _updateTaskInfo(){

        // roll through the properties of state
        // and make a new object only with the
        // properties needed by the API endpoint

        let body = this._duplicateObject(this.state, 'schedule');

        body.id = this.state.id;

        AsyncStorage.getItem('token')
        .then((token) =>
        {
            let url = '';
            let method = '';

            if(this.state.newItem === true)
            {
                method = 'POST';
                url = 'https://taskster-api.herokuapp.com/api/v1/task/add';
            }
            else {
                method = 'PUT';
                url = `https://taskster-api.herokuapp.com/api/v1/task/edit/${body.id}` ;
            }

            fetch(url,
                {
                    method: method,
                    headers:
                    {
                        'Content-Type':'application/json',
                        'Authorization':`Bearer ${token}`
                    },
                    body: JSON.stringify(body)
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                Alert.alert('Erro', error.message);
            })

        }).catch((error) => {
            Alert.alert('Erro', error.message);
        });

        let refresh = this.props.navigation.getParam('refresh');

        console.log('refresh closure' + this.state.refresh);

        // call this method to update the state of the previous activity

        refresh();

        this.props.navigation.goBack();

    }

    // small helper method to loop to object attributes

    _duplicateObject( obj: Object, threshold: string = null): Object
    {
        let newobj = {};
        for(let [key, val] of Object.entries(obj))
        {
            newobj[key] = val;
            if(key === threshold)
                break;
        }

        return newobj;
    }

    render() {

        return (

            <ScrollView
                contentContainerStyle={styles.container}
                scrollEnabled={true}
                onContentSizeChange={this._onContentSizeChange}>

                <View
                    style={styles.firstView}>

                    <Carousel
                        data={[{id:'0'}, {id:'1'}, {id:'2'}, {id:'3'}, {id:'4'}, {id:'5'}]}
                        style={styles.container}
                        renderItem={this._renderThumb}
                        itemWidth={width - leftPadding}
                        sliderWidth={width - leftPadding}
                        ref={(c) => {this._car = c}}
                        onSnapToItem={(slideIndex) =>
                        {
                            this.setState({bk:slideIndex})
                        }}

                    />

                    <TextField

                        containerStyle={{marginBottom: 20}}
                        label={'Título'}
                        keyboardType={'default'}
                        onChangeText={(text) => this.setState({title: text})}
                        value={this.state.title}
                        error={this.state.titleErr}
                    />

                    <TextField
                        containerStyle={{marginBottom: 20}}
                        label={'Conteúdo'}
                        keyboardType={'default'}
                        value={this.state.content}
                        multiline={true}
                        error={this.state.contentErr}
                        onChangeText={ (text) =>
                        {
                            this.setState({content: text})
                        }}
                    />

                    <Button
                        text={"Agendamento..."}
                        raised
                        secondary
                        icon={'alarm'}
                        onPress={() =>
                        {
                            this.setState({dpvisible :true})
                        }}
                    />

                    <DateTimePicker
                        isVisible={this.state.dpvisible}
                        mode={"datetime"}
                        onConfirm={(date) =>
                        {

                            this.setState({dpvisible :false,
                                schedule:date.toISOString()
                                    .slice(0, 19)
                                    .replace('T', ' ')})
                        }}
                        onCancel={
                            () =>
                            {
                                this.setState({dpvisible :false})
                            }
                        }
                    />

                </View>

                <View style={styles.secondView}>

                    <Text>Concluída: </Text>

                    <Switch
                        value={this.state.done}
                        onValueChange={(state) =>
                        {
                            this.setState({done:state});
                        }}
                    />

                </View>

                <View>

                    <Button
                        icon={'check'}
                        onPress={() => {this._onTaskSubmit()}}
                        raised
                        text="Salvar"
                        primary
                    />

                </View>

            </ScrollView>

        );
    }

}

const styles = StyleSheet.create({
    container:{
        padding:8,
        backgroundColor:'rgb(250,250,250)',
        alignItems: 'stretch',
        flexDirection:'column',
        justifyContent: 'space-around',
    },
    firstView:{
        flexGrow: 1,
        marginBottom:14,
    },
    secondView:{
        marginBottom:14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
    }
});
