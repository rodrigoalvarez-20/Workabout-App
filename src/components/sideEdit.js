import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import DatePicker from "react-datepicker";
import Spinner from "react-bootstrap/Spinner";

import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useCookies } from 'react-cookie';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const baseData = {
    "code": "",
    "name": "",
    "topics": "",
    "max_amount": 0,
    "deadline": new Date(),
    "exchange_date": new Date(),
    "requested": [],
    "comments": ""
}

const SideEventEdit = ({ btnVariant, btnText, data }) => {
    const [show, setShow] = useState(false);
    const [exchangeData, setExchangeData] = useState(baseData);
    const [myFriends, setMyFriends] = useState([]);
    const [cookies] = useCookies(['watk']);
    const [participantsEmails, setParticipantsEmails] = useState([]);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);

    const toogleClose = () => setShow(false);
    const toogleShow = () => setShow(true);

    useEffect(() => {
        if (data && data["_id"]) {

            var exDate = data["exchange_date"].split("/");
            var dateParsed = new Date(exDate[2], exDate[1] - 1, exDate[0]);

            var deadLine = "";
            if (data["deadline"]) {
                var deadDate = data["deadline"].split("/");
                deadLine = new Date(deadDate[2], deadDate[1] - 1, deadDate[0]);
            }

            var topicsStr = data["topics"].join(",");

            setParticipantsEmails(data["participants"].map(p => p["email"]))

            setExchangeData({ ...data, exchange_date: dateParsed, topics: topicsStr, deadline: deadLine });
        }

        axios.get("/api/users/info", { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data) {
                setMyFriends(r.data["friends"]);
            }
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
        });
    }, [data, cookies]);

    const updateDataValue = (e) => {
        setExchangeData({ ...exchangeData, [[e.target.name]]: e.target.value })
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const submitForUpdate = () => {
        var participants = [];
        var toAdd = [];

        const exDate = exchangeData["exchange_date"];
        const exDead = exchangeData["deadline"];

        if (!exDate) {
            toast.error("Debe de proporcionar una fecha valida");
        } else {
            setLoadingUpdate(true);
            const fmtDate = exDate.toLocaleDateString();
            var fmtDeadline = "";
            if (exDead) {
                fmtDeadline = exDead.toLocaleDateString();
            }

            myFriends.forEach(mf => {
                const mfSelector = window.document.getElementById(`mf-${mf["email"]}`);
                if (mfSelector.checked) {
                    const friendInEvent = data["participants"].filter(p => p["email"] === myFriends[mfSelector.value]["email"])[0];
                    if (friendInEvent) {
                        participants.push(friendInEvent);
                    } else {
                        toAdd.push(myFriends[mfSelector.value]);
                    }
                }
            })

            const updateOps = {
                "id": exchangeData["_id"],
                "code": exchangeData["code"],
                "name": exchangeData["name"],
                "topics": exchangeData["topics"].split(","),
                "max_amount": exchangeData["max_amount"],
                "exchange_date": fmtDate,
                "deadline": fmtDeadline,
                "participants": participants,
                "requested": toAdd,
                "comments": exchangeData["comments"]
            }

            axios.patch("/api/exchanges/update", updateOps,
                { headers: { "Authorization": cookies["token"] } }).then(r => {
                    if (r.data.message) {
                        toast.info(r.data.message);
                    } else {
                        toast.info("Se ha actualizado la informacion");
                    }
                    setLoadingUpdate(false);
                }).catch(e => {
                    if (e.response.data.error) {
                        toast.error(e.response.data.error);
                    } else {
                        toast.error("Ha ocurrido un error al realizar la peticion");
                    }
                    setLoadingUpdate(false);
                }).finally(() => sleep(3000).then(() => window.location.reload()));

        }
    }

    const submitForCreate = () => {
        var toAdd = [];

        const exDate = exchangeData["exchange_date"];
        const exDead = exchangeData["deadline"];

        if (!exDate) {
            toast.error("Debe de proporcionar una fecha valida");
        } else {
            setLoadingCreate(true);
            const fmtDate = exDate.toLocaleDateString();
            var fmtDeadline = "";
            if (exDead) {
                fmtDeadline = exDead.toLocaleDateString();
            }

            myFriends.forEach(mf => {
                const mfSelector = window.document.getElementById(`mf-${mf["email"]}`);
                if (mfSelector.checked) {
                    toAdd.push(myFriends[mfSelector.value]);
                }
            })

            const updateOps = {
                "id": exchangeData["_id"],
                "code": exchangeData["code"],
                "name": exchangeData["name"],
                "topics": exchangeData["topics"].split(","),
                "max_amount": exchangeData["max_amount"],
                "exchange_date": fmtDate,
                "deadline": fmtDeadline,
                "requested": toAdd,
                "comments": exchangeData["comments"]
            }

            axios.post("/api/exchanges/create", updateOps,
                { headers: { "Authorization": cookies["token"] } }).then(r => {
                    if (r.data.message) {
                        toast.info(r.data.message);
                    } else {
                        toast.info("Se ha creado el evento");
                    }
                    setLoadingUpdate(false);
                }).catch(e => {
                    if (e.response.data.error) {
                        toast.error(e.response.data.error);
                    } else {
                        toast.error("Ha ocurrido un error al realizar la peticion");
                    }
                    setLoadingUpdate(false);
                }).finally(() => sleep(3000).then(() => window.location.reload()));

        }
    }

    function renderButtonUpdate() {
        if (loadingUpdate) {
            return <Spinner className="offcanvasBtn" animation="grow" />
        } else {
            return <Button className="offcanvasBtn" variant="outline-info" onClick={submitForUpdate} >Actualizar informacion</Button>
        }
    }

    function renderButtonCreate() {
        if (loadingCreate) {
            return <Spinner className="offcanvasBtn" animation="grow" />
        } else {
            return <Button className="offcanvasBtn" variant="outline-success" onClick={submitForCreate} >Añadir</Button>
        }
    }

    return (
        <>
            <Button variant={btnVariant} onClick={toogleShow} disabled={!data["enabled"]}>
                {btnText}
            </Button>

            <Offcanvas show={show} onHide={toogleClose}>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false} />

                <Offcanvas.Header closeButton>
                    <Offcanvas.Title style={{ width: "80%" }}>
                        <FloatingLabel
                            controlId="floatingInput"
                            label="Nombre del evento"
                            className="mb-3">
                            <Form.Control type="text" placeholder="Evento de amigos" required name="name" size="sm" value={exchangeData["name"]} onChange={updateDataValue} />
                        </FloatingLabel>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>

                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Codigo del evento"
                                className="mb-3">
                                <Form.Control type="text" placeholder="ev-01Navidad" required name="code" size="sm" value={exchangeData["code"]} onChange={updateDataValue} />
                            </FloatingLabel>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Temas del evento"
                                className="mb-3">
                                <Form.Control type="text" name="topics" size="sm" value={exchangeData["topics"]} onChange={updateDataValue} />
                                <Form.Text muted>
                                    Introduzca los temas separados por comas
                                </Form.Text>
                            </FloatingLabel>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Presupuesto del evento"
                                className="mb-3">
                                <Form.Control type="numeric" placeholder="1000" required name="max_amount" size="sm" value={exchangeData["max_amount"]} onChange={updateDataValue} />
                            </FloatingLabel>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha final de registro</Form.Label>
                                <DatePicker startDate={new Date()} selected={exchangeData["deadline"]} onChange={(date) => setExchangeData({ ...exchangeData, "deadline": date })} />
                            </Form.Group>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha del evento</Form.Label>
                                <DatePicker startDate={new Date()} selected={exchangeData["exchange_date"]} onChange={(date) => setExchangeData({ ...exchangeData, "exchange_date": date })} />
                            </Form.Group>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Form.Label>Participantes</Form.Label>
                            {
                                myFriends.map((mf, idx) => {
                                    return (
                                        <Form.Check
                                            key={mf["email"]}
                                            type="checkbox"
                                            value={idx}
                                            defaultChecked={participantsEmails.includes(mf["email"])}
                                            id={`mf-${mf["email"]}`}
                                            label={`${mf["name"]} - ${mf["email"]} `}
                                        />
                                    )
                                })
                            }

                        </ListGroup.Item>

                        <ListGroup.Item>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Comentarios"
                                className="mb-3">
                                <Form.Control as="textarea" name="comments" size="sm" rows={4} value={exchangeData["comments"]} onChange={updateDataValue} />
                            </FloatingLabel>
                        </ListGroup.Item>
                    </ListGroup>

                    {
                        data["_id"] ? renderButtonUpdate() : renderButtonCreate()
                    }
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );

}

export default SideEventEdit;