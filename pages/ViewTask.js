import React from 'react';
import Carousel from 'react-native-snap-carousel';
import {Image, View, StyleSheet, AsyncStorage, Alert } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Button } from 'react-native-material-ui';
import DateTimePicker from 'react-native-modal-datetime-picker'

export default class ViewTask extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            id:null,
            title:'',
            content:'',
            bk:null,
            done:false,
            schedule:null,
            owner_id:null,
            dpvisible:false,

        }

    }

    _renderThumb({item, idx})
    {
        return (
            <Image
                style={{width:'100%', height:200,}}
                source={{uri:'https://taskster-api.herokuapp.com/images/default/bk/bk' + item.id + '.jpg'}}
            />
        );
    }

    render() {

        return (
            <View style={styles.container}>
                <Carousel data={[{id:'0'}, {id:'1'}, {id:'2'}, {id:'3'}, {id:'4'}, {id:'5'}]}
                      style={styles.container}
                      renderItem={this._renderThumb}
                      itemWidth={300}
                      firstItem={() =>
                      {
                          if(this.state.bk === null)
                              return 0;
                          else return this.state.bk;
                      }}
                      sliderWidth={300}
                      ref={(c) =>
                      {
                          this._carousel = c;
                      }}
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
                />

                <TextField
                    containerStyle={{marginBottom: 20}}
                    label={'Conteúdo'}
                    keyboardType={'default'}
                    value={this.state.content}
                    multiline={true}
                    onChangeText={
                        (text) =>
                        {
                            this.setState({title: text})
                        }
                    }
                />

                <Button
                    text={"Agendamento..."}
                    raised
                    secondary
                    onPress={
                        () =>
                        {
                            this.setState({dpvisible :true})
                        }
                    }

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

                <Button
                    onPress={() => {this._updateTaskInfo()}}
                    raised
                    text="Salvar"
                    primary
                />

            </View>

        );
    }

    componentDidMount(): void {

        let item = this.props.navigation.getParam('item');
        let stateItemData = {}

        for(let [key, val] of Object.entries(item))
        {
            stateItemData[key] = val;

        }
        this.setState(stateItemData);
        this.setState({dpvisible:false});


    }

    _updateTaskInfo(){

        let body = {id:this.state.id,
        new:{}};

        for(let [key, val] of Object.entries(this.state))
        {
            console.log(key, val);
            if(key === 'owner_id' || key === 'dpvisible' || key === 'key') continue;
            else body.new[key] = val;
        }

        console.log(body);

        AsyncStorage.getItem('token')
        .then((token) =>
        {
            fetch('https://taskster-api.herokuapp.com/api/v1/task/edit',
                {
                    method:'PATCH',
                    headers:
                    {
                        'Content-Type':'application/json',
                        'Authorization':'Bearer ' + token
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
        })

        this.props.navigation.goBack();

    }

}

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:8,
        borderWidth: 1, borderColor:'red',
    },
});
