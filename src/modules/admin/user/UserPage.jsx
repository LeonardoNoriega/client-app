import React, { useMemo, useState, useEffect } from 'react';
import { TextInput, Label, Button, Card, Tooltip } from 'flowbite-react';
import { IoIosAdd } from "react-icons/io";
import { LiaUserEditSolid, LiaTrashAltSolid  } from "react-icons/lia";
import RegisterUserForm from './components/RegisterUserForm';
import UpdateUserForm from './components/UpdateUserForm';
import CustomDataTable from '../../../components/CustomDataTable';
import AxiosClient from '../../../config/http-client/axios-client';

const UserPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const handleClickEdit = (user) => {
        setSelectedUser(user);
        setIsUpdate(true);
    };

    const toggleUserStatus = async (userId) => {
        try {
            const session = JSON.parse(localStorage.getItem('user'));
            const userToUpdate = users.find(user => user.id === userId);
            if (!userToUpdate) {
                console.error('Usuario no encontrado');
                return;
            }
            const response = await AxiosClient({
                url: `/user/${userId}/status`,
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${session.token}`
                },
                params: { activate: !userToUpdate.status }
            });
            if (response && !response.error) {
                getUsers();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getUsers = async () => {
        setLoading(true);
        try {
            const session = JSON.parse(localStorage.getItem('user'));
            const response = await AxiosClient({
                url: "/user/",
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${session.token}`
                }
            });
            if (response && !response.error) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []); 
    const columns = useMemo(() => [
        {
            name: '#',
            cell: (row, i) => <>{i + 1}</>,
            selector: (row, i) => i,
            sortable: true,
        },
        {
            name: 'Usuario',
            cell: (row) => <>{row.username}</>,
            selector: (row) => row.username,
            sortable: true,
        },
        {
            name: 'Nombre completo',
            cell: (row) => <>{`${row.person.name} ${row.person.surname} ${row.person.lastname ?? ''} `}</>,
            selector: (row) => `${row.person.name} ${row.person.surname} ${row.person.lastname ?? ''} `,
            //Selector es la guia del sortable, sortable se usa para ordenar
            sortable: true,
        },{
            name:'Estado',
            cell:(row) => <>{`${row.status}`}</>,
            selector:(row)=> `${row.status}`,
            sortable:true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <>
                    <Tooltip content='Editar'>
                        <Button onClick={() => handleClickEdit(row)} style={{ backgroundColor: '#156FF6', border: 'none', cursor: 'pointer', marginLeft: 3 }}>
                            <LiaUserEditSolid style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }} />
                        </Button>
                    </Tooltip>
                    <Tooltip content='Eliminar'>
                        <Button style={{ backgroundColor: '#ff0000', border: 'none', cursor: 'pointer', marginLeft: 3 }} onClick={() => toggleUserStatus(row.id)}> <LiaTrashAltSolid style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }} /></Button>
                    </Tooltip>
                </>
            ),
        },
    ], [users]);

    return (
        <section className='w-full px-4 pt-4 flex flex-col gap-4'>
            <h1 className='text-2xl'>Usuarios</h1>
            <div className='flex justify-between'>
                <div className='max-w-64'>
                    <Label htmlFor='' />
                    <TextInput type='text' id='filter' placeholder='Buscar...' />
                </div>
                <Button outline color='success' onClick={() => setIsCreating(true)} pill><IoIosAdd size={24} /></Button>
                <RegisterUserForm isCreating={isCreating} setIsCreating={setIsCreating} getAllUsers={getUsers}/>
                <UpdateUserForm isUpdate={isUpdate} setIsUpdate={setIsUpdate} getAllUsers={getUsers} selectedUser={selectedUser}/>
            </div>
            <Card>
                <CustomDataTable
                    columns={columns}
                    data={users}
                    isLoading={loading}
                />
            </Card>
        </section>
    );
};

export default UserPage;
