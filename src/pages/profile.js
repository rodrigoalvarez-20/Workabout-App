import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import CustomNavbar from "../components/navbar";
import { useEffect, useState } from "react";
import Logo from "../images/gift.png";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import 'react-toastify/dist/ReactToastify.css';


const Profile = () => {
    const [cookies] = useCookies(['watk']);
    const [isEditing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [alias, setAlias] = useState("");
    const [friends, setFriends] = useState([]);
    const [isLoading, setLoadingState] = useState(true);
    const [isFormLoading, setFormLoadingState] = useState(false);
    const [addedFriends, setAddedFriends] = useState([]);
    const [baseData, setBaseData] = useState({});

    const baseFriend = { "name": "Jane Doe", "email": "janedoe@example.com" };
    const navigate = useNavigate();

    const navTags = [
        {
            "name": "Intercambios",
            "path": "/home"
        },
        {
            "name": "Perfil",
            "path": "/profile"
        },
    ]

    useEffect(() => {
        if (!cookies["token"]) {
            navigate("/", { replace: true })
        }
    }, [cookies, navigate])

    useEffect(() => {
        axios.get("/api/users/info", { headers: { "Authorization": cookies["token"] } }).then(r => {
            const { name, alias, friends } = r.data;
            setBaseData(r.data);
            setName(name);
            setAlias(alias);
            setFriends(friends);
            setLoadingState(false);
        }).catch(error => {
            if (error.response.data.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
        })
    }, [cookies])

    const deleteFriend = (f) => {
        if (friends.includes(f)) {
            setFriends(friends.filter(v => v !== f))
        } else if (addedFriends.includes(f)) {
            setAddedFriends(addedFriends.filter(v => v !== f))
        }
    }

    const updateFriendValue = (f, e) => {
        if (friends.includes(f)) {
            friends[friends.indexOf(f)][[e.target.name]] = e.target.value;
            setFriends([...friends]);
        } else if (addedFriends.includes(f)) {
            addedFriends[addedFriends.indexOf(f)][e.target.name] = e.target.value;
            setAddedFriends([...addedFriends]);
        }
    }

    const renderFriendItem = ({ elem, idx }) => {
        const { name, email } = elem;
        return (
            <tr key={idx}>
                <td>{idx + 1}</td>
                <td><Form.Control type="text" value={name} name="name" readOnly={!isEditing} onChange={(e) => updateFriendValue(elem, e)} /></td>
                <td><Form.Control type="text" value={email} name="email" readOnly={!isEditing} onChange={(e) => updateFriendValue(elem, e)} /></td>
                <td style={{ textAlign: "center" }}><Button variant="outline-danger" disabled={!isEditing} onClick={() => deleteFriend(elem)} >Eliminar</Button></td>
            </tr>
        )
    }


    const toogleEdit = () => {
        if (isEditing) {
            setAddedFriends([]);
            setName(baseData["name"]);
            setAlias(baseData["alias"])
            setFriends(baseData["friends"]);
        }
        setEditing(!isEditing);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    const submitUpdate = (e) => {
        e.preventDefault();

        if (name.trim() === "" || alias.trim() === "") {
            toast.warning("No puede dejar los campos vacios");
        } else {
            const newFriends = friends.concat(addedFriends);

            setFormLoadingState(true);
            axios.patch("/api/users/update", { name, alias, friends: newFriends }, { headers: { "Authorization": cookies["token"] } }).then(r => {
                if (r.data.message) {
                    toast.success(r.data.message);
                } else {
                    toast.success("Se ha actualizado la informacion");
                }

                sleep(5000).then(() => window.location.reload());

            }).catch(error => {
                if (error.response.data.error) {
                    toast.error(error.response.data.error);
                } else {
                    toast.error("Ha ocurrido un error al realizar la peticion");
                }
                toogleEdit();
            }).finally(() => {
                setFormLoadingState(false);
            })

        }

    }

    const renderForm = () => {
        return (
            <Form className="profileForm" onSubmit={submitUpdate}>
                <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} readOnly={!isEditing} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Alias</Form.Label>
                    <Form.Control type="text" value={alias} onChange={(e) => setAlias(e.target.value)} readOnly={!isEditing} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Amigos añadidos</Form.Label>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                friends.concat(addedFriends).map((f, i) => {
                                    return renderFriendItem({ elem: f, idx: i });
                                })
                            }
                        </tbody>
                    </Table>
                </Form.Group>
                <Row>
                    <Col xs={12} sm={isEditing ? 3 : 2} style={{ textAlign: "center", marginTop: "12px" }}>
                        <Button variant="outline-warning" onClick={toogleEdit}>
                            {isEditing ? "Cancelar" : "Editar datos"}
                        </Button>
                    </Col>
                    {
                        isEditing ? <Col xs={12} sm={3} style={{ textAlign: "center", marginTop: "12px" }}>
                            <Button variant="outline-info" onClick={() => setAddedFriends([...addedFriends, baseFriend])}>Añadir amigo</Button>
                        </Col> : null
                    }
                    <Col xs={12} sm={isEditing ? 3 : 2} style={{ textAlign: "center", marginTop: "12px" }}>
                        {isFormLoading ? <Spinner animation="grow" style={{ display: "flex", margin: "auto" }} /> : <Button variant="outline-success" type="submit" disabled={!isEditing}>
                            Guardar cambios
                        </Button>}
                    </Col>

                </Row>

            </Form>
        )
    }

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false} />

            <CustomNavbar links={navTags} enableLogout={true} />
            <div className="bgImageLanding" style={{ height: "100%" }}>
                <Container className="centerContainer" style={{ margin: "24px auto" }}>
                    <Image src={Logo} roundedCircle className="imageLogo" />
                    <h2>Perfil de usuario</h2>
                    {
                        isLoading ? <Spinner animation="border" style={{ display: "flex", margin: "24px auto" }} /> : renderForm()
                    }
                </Container>
            </div>
        </div>
    )
}

export default Profile;