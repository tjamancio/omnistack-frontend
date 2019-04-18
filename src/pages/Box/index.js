import React, { Component } from 'react';
import { MdInsertDriveFile } from 'react-icons/md';
import Dropzone from 'react-dropzone';
import socket from 'socket.io-client';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import api from '../../services/api';

import logo from '../../assets/logo.svg';
import './styles.css';

export default class Box extends Component {

    state = {
        box: {}
    }

    async componentDidMount() {
        this.subscribeToNewFiles();
        const id = this.props.match.params.id;
        const response = await api.get(`boxes/${id}`)
        this.setState({
            box: response.data
        });
    }

    handleUpload = files => {
        files.forEach(file => {
            console.log(file)
            const data = new FormData();
            const boxId = this.props.match.params.id;
            data.append('file', file);

            api.post(`boxes/${boxId}/files`, data);
        })
    }

    subscribeToNewFiles = () => {
        const boxId = this.props.match.params.id;
        const io = socket("https://omnistack-backend102.herokuapp.com");

        io.emit('connectRoom', boxId);

        io.on('file', data => {
            console.log(data);
            this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } })
        })

    }

    render() {
        return (
            <div id='box-container'>
                <header>
                    <img src={logo} alt='' />
                    <h1>{this.state.box.title}</h1>
                </header>

                <Dropzone onDropAccepted={this.handleUpload}>
                    {({ getRootProps, getInputProps }) => (
                        <div className="upload" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Arraque arquivos ou clique aqui</p>
                        </div>
                    )}
                </Dropzone>
                <ul>
                    {this.state.box.files && this.state.box.files.map(file => (
                        <li key={file._id}>
                            <a className='fileInfo' href={file.url} target='_blank' rel='noopener noreferrer'>
                                <MdInsertDriveFile size={24} color='#a5cfff' />
                                <strong>{file.title}</strong>
                            </a>
                            <span>
                                há {distanceInWords(file.createdAt, new Date(), {
                                    locale: pt
                                })}
                            </span>
                        </li>
                    ))}

                </ul>
            </div>

        )
    }
}
