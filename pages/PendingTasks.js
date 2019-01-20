import React from 'react';
import { AsyncStorage, StyleSheet,
        Text, View, ActivityIndicator,
        FlatList, ImageBackground } from 'react-native';
import { Toolbar, Card, ActionButton } from 'react-native-material-ui';


export default class PendingTasks extends React.Component {

    constructor(props){
        super(props);

        this.state = {tasks:[],
                      spinner: true,};
    }

    static navigationOptions = {
        headerTransparent: true,
    };

    componentDidMount(): void {
        this._refreshData();
    }

    _refreshData = () => {


        console.log('refreshing');

        this.setState({spinner: true, tasks:[]});

        // clear the tasks array

        AsyncStorage.getItem('token')
        .then((token) =>
        {
            let body = JSON.stringify({
                offset:this.state.tasks.length
            });

            fetch('https://taskster-api.herokuapp.com/api/v1/tasks',
            {
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer ' + token // TODO: interpolation es6
                },
                body: body
            })
            .then((response) =>
            {

                let body = JSON.parse(response._bodyText);

                this.setState({tasks:body.status, spinner: false});

            })
            .catch(error =>
            {
                this.setState({spinner: false});
                console.log(error)
            });

        });

    };

    /*_addKeysToTasks = (tasks) => {

        return tasks.map(task => {
            return Object.assign(task, { key: task.id.toString() });
        });
    };*/

    _renderItem = (data) => {

        let bk = data.item.bk === null ? '0': data.item.bk;

        let content;

        if(data.item.length > 100)
            content = data.item.content.substring(0,100) + '...';
        else content = data.item.content;

        return <Card style={styles.card}
                     onPress={() => {
                         this.props.navigation
                             .navigate('ViewTask', {
                                 item:data.item,
                                 refresh:() => this._refreshData(),
                                 new:false
                             })
                     }}>
                    <ImageBackground
                        style={styles.thumb}
                        source={
                            {uri:'https://taskster-api.herokuapp.com/images/default/bk/bk' + bk + '.jpg'}
                        }>
                        <Text style={styles.cardTitle}>{data.item.title}</Text>
                    </ImageBackground >

                    <Text style={styles.cardContent}>{content}</Text>
               </Card>

    }

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
                        menu:{
                            icon:'more-vert',
                            labels:['Sobre...', 'Sair']
                        }
                    }}
                />

                <FlatList
                    ListEmptyComponent={<ActivityIndicator style={{alignSelf: 'center'}} size="large" color="#0000ff" animating={this.state.spinner} />}
                    style={styles.list}
                    data={this.state.tasks}
                    renderItem={this._renderItem}
                    keyExtractor={(item: object, index: number) => {item.id.toString();}}
                    refreshing={() => {this.state.spinner}}
                />

                <ActionButton
                    icon="add"
                    onPress={() => this.props.navigation
                        .navigate('ViewTask', {
                            item:null,
                            refresh:() => this._refreshData(),
                            new:true
                        })}
                />

            </View>

        );
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