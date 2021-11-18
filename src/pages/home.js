import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";


import CustomNavbar from "../components/navbar";
import SideEventInfo from '../components/sideInfo';
import SideEventEdit from '../components/sideEdit';
import DrawEventModal from '../components/drawEvent';

const Home = () => {
    const [myEventList, setMyEventList] = useState([]);
    const [myAcceptedEventList, setMyAcceptedEventList] = useState([]);
    const [myPendingEventList, setMyPendingEventList] = useState([]);
    const [isFetchingMyEvents, setIsFetchingMyEvents] = useState(true);
    const [isFetchingMyAcceptedEvents, setIsFetchingMyAcceptedEvents] = useState(true);
    const [isFetchingMyPendingEvents, setIsFetchingMyPendingEvents] = useState(true);
    const [loadingAceptInv, setLoadingAceptInv] = useState(false);
    const [loadingDeclineInv, setLoadingDeclineInv] = useState(false);
    const [loadingExitInv, setLoadingExitInv] = useState(false);
    const [isDisableSelector, setDisabledSelector] = useState(false);
    const [loadingDeleteEv, setLoadingDeleteEv] = useState(false);

    const [cookies] = useCookies(['watk']);
    const navigate = useNavigate();

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
        const list = "/api/exchanges/list";
        const accepted = "/api/exchanges/accepted";
        const pending = "/api/exchanges/pending";

        const getMyList = axios.get(list, { headers: { "Authorization": cookies["token"] } });
        const getAllAccepted = axios.get(accepted, { headers: { "Authorization": cookies["token"] } });
        const getEvPending = axios.get(pending, { headers: { "Authorization": cookies["token"] } });

        axios.all([getMyList, getAllAccepted, getEvPending]).then(axios.spread(async (...responses) => {
            const myEventsData = responses[0];
            const myAcceptedEventsData = responses[1];
            const myPendingEventsData = responses[2];

            setMyEventList(myEventsData.data["exchanges"]);
            setIsFetchingMyEvents(false);

            setMyAcceptedEventList(myAcceptedEventsData.data["exchanges"]);
            setIsFetchingMyAcceptedEvents(false);

            setMyPendingEventList(myPendingEventsData.data["exchanges"]);
            setIsFetchingMyPendingEvents(false);


        })).catch(errors => {
            console.log(errors);
            toast.error("Ha ocurrido un error al obtener la informacion");
        });
    }, [cookies]);


    function acceptEventInvitation(id) {
        setLoadingAceptInv(true);
        axios.post(`/api/exchanges/accept-event/${id}`, {}, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Se ha aceptado la invitacion");
            }
            sleep(2000).then(() => window.location.reload());
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
            setLoadingAceptInv(false);
        });
    }

    function declineInv(id) {
        setLoadingDeclineInv(true);
        axios.post(`/api/exchanges/decline/${id}`, {}, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Se ha eliminado la invitacion");
            }
            sleep(2000).then(() => window.location.reload());
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
            setLoadingDeclineInv(false);
        });
    }

    function exitFromEvent(id) {
        setLoadingExitInv(true);
        axios.post(`/api/exchanges/exit/${id}`, {}, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Ha salido del evento");
            }
            sleep(2000).then(() => window.location.reload());
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
            setLoadingExitInv(false);
        });
    }

    function updatePref(e, id) {
        const val = e.target.value;
        setDisabledSelector(true);

        axios.patch("/api/exchanges/prefs", { id, "selected_topic": val }, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Se ha cambiado su preferencia en el evento");
            }
            sleep(3000).then(() => window.location.reload())
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
        }).finally(() => setDisabledSelector(false))

    }

    function deleteEvent(id) {
        setLoadingDeleteEv(true);
        axios.delete(`/api/exchanges/${id}`, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Se ha eliminado el evento");
            }
            sleep(2000).then(() => window.location.reload());
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
            setLoadingDeleteEv(false);
        });
    }

    const renderEventListItem = ({ elem, idx }) => {
        const { _id, code, topics, max_amount, exchange_date } = elem;
        return (
            <tr key={idx}>
                <td>{code}</td>
                <td>{topics.join(", ")}</td>
                <td>${max_amount}</td>
                <td>{exchange_date}</td>
                {/* Aqui esta */}
                <td style={{ textAlign: "center" }}><DrawEventModal event={elem} /></td>
                <td style={{ textAlign: "center" }}><SideEventEdit btnText="Editar" btnVariant="outline-info" data={elem} /></td>
                <td style={{ textAlign: "center" }}>{
                    loadingDeleteEv ? <Spinner animation="grow" /> : <Button variant="outline-danger" onClick={() => deleteEvent(_id)} >Eliminar</Button>
                }</td>
            </tr>
        )
    }

    const renderAcceptedEventListItem = ({ elem, idx }) => {
        const { _id, code, topics, max_amount, exchange_date, participants } = elem;
        var me = participants.filter(p => p["email"] === cookies["email"])[0];
        //me["pref"] = "Navidad"
        return (
            <tr key={idx}>
                <td>{code}</td>
                <td>{topics.join(", ")}</td>
                <td>${max_amount}</td>
                <td>{exchange_date}</td>
                <td style={{ textAlign: "center" }}>
                    <Form.Select value={me["pref"]} onChange={(e) => updatePref(e, _id)} disabled={isDisableSelector} >
                        <option value=""></option>
                        {
                            topics.map((t, i) => <option key={i} value={t}>{t}</option>)
                        }
                    </Form.Select>
                </td>
                <td style={{ textAlign: "center" }}><SideEventInfo btnText="Informacion" btnVariant="outline-info" data={elem} /></td>
                <td style={{ textAlign: "center" }}>
                    {
                        loadingExitInv ? <Spinner animation="grow" /> : <Button variant="outline-danger" onClick={() => exitFromEvent(_id)} >Salir</Button>
                    }
                </td>
            </tr>
        )
    }

    const renderPendingEventListItem = ({ elem, idx }) => {

        const { _id, code, topics, max_amount, exchange_date } = elem;
        return (
            <tr key={idx}>
                <td>{code}</td>
                <td>{topics.join(", ")}</td>
                <td>${max_amount}</td>
                <td>{exchange_date}</td>
                <td style={{ textAlign: "center" }}>
                    {
                        loadingAceptInv ?
                            <Spinner animation="grow" /> :
                            <Button variant="outline-success" onClick={() => acceptEventInvitation(_id)}>Aceptar</Button>
                    }
                </td>
                <td style={{ textAlign: "center" }}><SideEventInfo btnText="Informacion" btnVariant="outline-info" data={elem} /></td>
                <td style={{ textAlign: "center" }}>
                    {
                        loadingDeclineInv ? <Spinner animation="grow" /> :
                            <Button variant="outline-danger" onClick={() => declineInv(_id)}>Declinar</Button>
                    }
                </td>
            </tr>
        )
    }

    function renderMyEventsList() {
        return (
            <Table responsive>
                <thead style={{ color: "gainsboro" }} >
                    <tr>
                        <th>Codigo</th>
                        <th>Temas</th>
                        <th>Presupuesto</th>
                        <th>Fecha de intercambio</th>
                        <th colSpan={3}>Acciones</th>
                    </tr>
                </thead>
                <tbody style={{ color: "white" }}>
                    {
                        myEventList.map((event, i) => {
                            return renderEventListItem({ elem: event, idx: i });
                        })
                    }
                </tbody>
            </Table>
        )
    }

    function renderMyAcceptedEventsList() {
        return (
            <Table responsive>
                <thead style={{ color: "gainsboro" }} >
                    <tr>
                        <th>Codigo</th>
                        <th>Temas</th>
                        <th>Presupuesto</th>
                        <th>Fecha de intercambio</th>
                        <th>Tema elegido</th>
                        <th colSpan={2}>Acciones</th>
                    </tr>
                </thead>
                <tbody style={{ color: "white" }}>
                    {
                        myAcceptedEventList.map((event, i) => {
                            return renderAcceptedEventListItem({ elem: event, idx: i });
                        })
                    }
                </tbody>
            </Table>
        )
    }

    function renderMyPendingEventsList() {
        return (
            <Table responsive>
                <thead style={{ color: "gainsboro" }} >
                    <tr>
                        <th>Codigo</th>
                        <th>Temas</th>
                        <th>Presupuesto</th>
                        <th>Fecha de intercambio</th>
                        <th colSpan={2} >Acciones</th>
                    </tr>
                </thead>
                <tbody style={{ color: "white" }}>
                    {
                        myPendingEventList.map((event, i) => {
                            return renderPendingEventListItem({ elem: event, idx: i });
                        })
                    }
                </tbody>
            </Table>
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
                    <h2>Eventos creados</h2>
                    <div style={{ textAlign: "end" }}><SideEventEdit btnText="Añadir evento" btnVariant="success" data={{}} /></div>

                    {
                        isFetchingMyEvents ? <Spinner animation="border" style={{ display: "flex", margin: "24px auto" }} /> : renderMyEventsList()
                    }
                    <h2>Eventos aceptados</h2>
                    {
                        isFetchingMyAcceptedEvents ? <Spinner animation="border" style={{ display: "flex", margin: "24px auto" }} /> : renderMyAcceptedEventsList()
                    }
                    <h2>Eventos pendientes</h2>
                    {
                        isFetchingMyPendingEvents ? <Spinner animation="border" style={{ display: "flex", margin: "24px auto" }} /> : renderMyPendingEventsList()
                    }
                </Container>
            </div>


        </div>
    )
}

export default Home;