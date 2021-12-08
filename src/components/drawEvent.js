import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";


import { useEffect, useState } from "react";

import axios from "axios";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";

import dice from "../lotties/dice.json";
import Lottie from "react-lottie";

const DrawEventModal = ({ event }) => {

    const [cookies] = useCookies(['watk']);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [displayAnim, setDisplayAnim] = useState(false);

    const [drawResults, setDrawResults] = useState([]);
    const [orgDwRes, setOrgDwRes] = useState([])

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: dice,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    function renderLottieAnimation() {
        return <Lottie options={defaultOptions}
            style={{ backgroundColor: "black", borderRadius: "24px" }}
            height={400}
            width={400} />
    }

    function renderParticipant(name, email, pref, color) {
        return (
            <OverlayTrigger
                key={email}
                placement="top"
                overlay={
                    <Tooltip key={email} style={{ width: "auto" }}>
                        {email}
                    </Tooltip>
                }
            >
                <ListGroup.Item variant={color ? color : "info"}> {name} - {pref}</ListGroup.Item>
            </OverlayTrigger>
        )
    }

    function displayDrawResults() {
        return (
            <Row>
                <Col xs={12} sm={12}><h3>Resultados</h3></Col>
                <ListGroup variant="flush" style={{ textAlign: "center" }}>
                    {
                        drawResults.map(dr => {
                            const p1 = dr[0];
                            const p2 = dr[1];
                            return (<Row xs={12} sm={2}>
                                <Col>{renderParticipant(p1["name"], p1["email"], p1["pref"], "success")}</Col>
                                <Col>{renderParticipant(p2["name"], p2["email"], p2["pref"], "success")}</Col>
                            </Row>
                            )
                        })
                    }
                </ListGroup>
            </Row>
        )
    }

    function renderData() {
        return (
            <Container>
                <Row>
                    <Col><h5>Codigo del evento: {event["code"]}</h5></Col>
                </Row>
                <Row>
                    <Col>Temas seleccionados: {event["topics"].join(", ")}</Col>
                </Row>
                <Row>
                    <Col>Presupuesto: <span style={{ color: "#85BB65" }}>${event["max_amount"]}</span></Col>
                </Row>
                <Row>
                    <Col>Comentarios: {event["comments"]}</Col>
                </Row>
                <Row>
                    <Col xs={12} sm={12}><h5>Participantes</h5></Col>
                    <Col>

                        <ListGroup>
                            {
                                event["participants"].map(p => renderParticipant(p["name"], p["email"], p["pref"]))
                            }
                        </ListGroup>
                    </Col>
                </Row>
                {
                    drawResults.length > 0 ? displayDrawResults() : null
                }

            </Container>
        )
    }

    const setDraw = () => {
        setDisplayAnim(true);

        setDrawResults([]);
        axios.post(`/api/exchanges/right-now/${event["_id"]}`, {}, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data) {
                const elements = r.data.resultados;
                setOrgDwRes(elements);
                var tempRes = [];
                for (var i = 0; i < elements.length; i += 2) {

                    let tempArray;
                    tempArray = elements.slice(i, i + 2);
                    tempRes.push(tempArray);
                }
                setDrawResults(tempRes);
            }
        }).catch(error => {
            if (error.response.data) {
                alert(error.response.data.error);
            } else {
                alert("Ha ocurrido un error al realizar el sorteo, por favor intente de nuevo");
            }
        }).finally(() => setDisplayAnim(false));
    }

    const finalizeEvent = () => {
        axios.post(`/api/exchanges/finish/${event["_id"]}`, { "participants": orgDwRes }, { headers: { "Authorization": cookies["token"] } }).then(r => {
            if (r.data) {
                alert(r.data.message);
            } else {
                alert("Se ha finalizado el evento");
            }
        }).catch(e => {
            if (e.response.data) {
                alert(e.response.data.error);
            } else {
                alert("Ha ocurrido un error al realizar el sorteo, por favor intente de nuevo");
            }
        }).finally(() => {
            setShow(false);
            window.location.reload()
        });
    }

    return (
        <>
            <Button variant="outline-warning" onClick={handleShow}>
                Realizar
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{`Bienvenido al evento `}<i>{event["name"]}</i></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        displayAnim ? renderLottieAnimation() : renderData()
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={setDraw}>
                        Realizar sorteo
                    </Button>
                    <Button variant="outline-danger" onClick={finalizeEvent} >Finalizar evento</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DrawEventModal;