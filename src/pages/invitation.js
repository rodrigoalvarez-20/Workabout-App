import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Invitation = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState("")
    const [loadingAccept, setLoadingAccept] = useState(false);

    useEffect(() => {
        const params = window.location.search.split("?tk=")[1];
        if (!params) {
            navigate("/", { replace: true });
        } else {
            setToken(params);
        }
    }, [])

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const acceptInv = () => {
        axios.get("/api/exchanges/accept", { headers: { "Authorization": token } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Se ha aceptado la invitacion");
            }
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
        }).finally(() => {
            setLoadingAccept(false);
            sleep(5000).then(() => navigate("/", { replace: true }));
        });
    }

    const declineInv = () => {
        axios.post("/api/exchanges/decline-invitation", {}, { headers: { "Authorization": token } }).then(r => {
            if (r.data.message) {
                toast.success(r.data.message);
            } else {
                toast.success("Se ha declinado la invitacion");
            }
        }).catch(e => {
            if (e.response.data.error) {
                toast.error(e.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al realizar la peticion");
            }
        }).finally(() => {
            setLoadingAccept(false);
            sleep(5000).then(() => navigate("/", { replace: true }));
        });
    }

    return (
        <div className="bgImageLanding">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false} />
            <Container className="centerContainer">
                <h2>Invitacion de evento</h2>
                <Row style={{ textAlign: "center", margin: "24px auto" }}>
                    <Col xs={12} sm={6}>{
                        loadingAccept ? <Spinner animation="grow" /> : <Button variant="success" style={{ marginTop: "24px" }} onClick={acceptInv}>Aceptar invitacion</Button>
                    }</Col>
                    <Col xs={12} sm={6} style={{ marginTop: "24px" }}><Button variant="danger" onClick={declineInv} >Declinar invitacion</Button></Col>
                </Row>
            </Container>
        </div>

    )
}

export default Invitation;