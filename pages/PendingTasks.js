import React from 'react';
import { AsyncStorage, StyleSheet,
        Text, View, ActivityIndicator,
        FlatList, Dimensions } from 'react-native';
import { Toolbar, ActionButton } from 'react-native-material-ui';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const OFFSET = 100;

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

        this.setState({spinner: true, tasks:[]});

        // clear the tasks array

        AsyncStorage.getItem('token')
        .then((token) =>
        {

            fetch(`https://taskster-api.herokuapp.com/api/v1/tasks/${this.state.tasks.length}`,
            {
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                }
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

    _renderItem = (data) => {

        let bk = data.item.bk === null ? '0': data.item.bk;

        let content;

        if(data.item.length > 100)
            content = data.item.content.substring(0,100) + '...';
        else content = data.item.content;

        return <Card style={styles.card}>
            <Card onPress={() => {
                this.props.navigation
                    .navigate('ViewTask', {
                        item_id:data.item.id,
                        refresh:() => this._refreshData(),
                        new:false
                    })
                }}>

                <Card.Cover
                    source={{ uri: `https://taskster-api.herokuapp.com/images/default/bk/bk${bk}.jpg` }}
                />
                <Card.Content>
                    <Title>{data.item.title}</Title>
                    <Paragraph>{content}</Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button style={styles.cardButton}
                            icon={"check"} color={"green"}
                            mode={"outlined"}>Concluir</Button>
                    <Button style={styles.cardButton}
                            icon={"close"} color={"red"}
                            mode={"outlined"}>Exluir</Button>
                </Card.Actions>
            </Card>

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
                    ListEmptyComponent={<ActivityIndicator
                                        style={styles.spinner}
                                        size="large"
                                        color="#0000ff"
                                        animating={this.state.spinner}
                                        />}
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
                            item_id:null,
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
        marginLeft:4,
        marginRight:4,
        marginTop:4
    },
    cardButton:{
        marginRight:4,
    },
    spinner:{

        marginTop: (height / 2) - OFFSET

    },

});