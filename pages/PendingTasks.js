import React from 'react';
import {AsyncStorage, StyleSheet, Text, View, FlatList, ImageBackground } from 'react-native';
import { Toolbar, Card, ActionButton } from 'react-native-material-ui';

export default class PendingTasks extends React.Component {

    constructor(props){
        super(props);

        this.state = {tasks:[]};
    }

    static navigationOptions = {
        headerTransparent: true,
    };

    render() {

        return (
            <View style={styles.container}>
                <Toolbar
                    style={styles.toolbar}
                    leftElement="menu"
                    centerElement=""
                    searchable={{
                        autoFocus:true,
                        placeholder: 'Pesquisar',
                    }}
                    rightElement={{
                        menu:{icon:'more-vert',
                            labels:['Sobre...', 'Sair']}
                    }}
                />

                <FlatList
                    style={styles.list}
                    data={this.state.tasks}
                    renderItem={this._renderItem}
                    refre
                />
                <ActionButton/>

            </View>

        );
    }
    componentDidMount(): void {
        this._refreshData();
    }

    _refreshData = () => {

        AsyncStorage.getItem('token').then((token) =>
        {
            let body = JSON.stringify({
                offset:this.state.tasks.length
            });

            fetch('https://taskster-api.herokuapp.com/api/v1/tasks',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + token
                },
                body: body
            })
            .then((response) =>
            {
                let body = JSON.parse(response._bodyText);

                this.setState({tasks:this._addKeysToTasks(body.status)});

            })
            .catch(error =>
            {
                console.log(error)
            });

        });

    };

    _addKeysToTasks = (tasks) => {

        return tasks.map(task => {
            return Object.assign(task, { key: task.id.toString() });
        });
    };

    _renderItem = data =>
    {
        let bk = data.item.bk === null ? '0': data.item.bk;

        let content;

        if(data.item.length > 100)
            content = data.item.content.substring(0,100) + '...';
        else content = data.item.content;

        return <Card style={styles.card}>
                    <ImageBackground
                        style={styles.thumb}
                        source={{uri:'https://taskster-api.herokuapp.com/images/default/bk/bk' + bk + '.jpg'}}>
                        <Text style={styles.cardTitle}>{data.item.title}</Text>
                    </ImageBackground >

                    <Text style={styles.cardContent}>{content}</Text>
               </Card>

    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: '#fff',
        alignItems: 'stretch',
    },
    toolbar:{
    },
    list: {
        width:'100%',
    },
    card:{
    },
    cardTitle: {
        paddingLeft:8,
        fontSize: 25,
        position:'absolute',
        bottom:8,
        color:'white',

    },
    cardContent: {
        paddingLeft:8,
        paddingBottom:8,

    },
    thumb:{
        width:'100%',
        height:150,
    }

});