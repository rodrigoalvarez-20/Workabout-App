import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from dotenv import load_dotenv

load_dotenv()


def send_confirm_email(to="", link="", name="", user="", date="", subject="", deadline=""):
    sender_email = os.environ.get("GMAIL_USER")
    receiver_email = to

    message = MIMEMultipart("alternative")
    message["Subject"] = "Invitacion a evento de intercambio"
    message["From"] = sender_email
    message["To"] = receiver_email

    html = f"""\
    <html>
    <body>
        <p>Hola {name}<br>
        <p>El usuario {user} le esta invitando a participar en el evento <i>{subject}</i> el dia <b>{date}</b></p>
        <p>Presione el siguiente link para aceptar: <a href="{link}">Unirse al intercambio</a></p>
        { f"Usted tiene hasta el {deadline} para unirse" if deadline else '' }
    </body>
    </html>
    """

    body = MIMEText(html, "html")

    message.attach(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, os.environ.get("GMAIL_PWD"))
        server.sendmail(sender_email, receiver_email, message.as_string())
        print(f"Mensaje enviado a {to}")


def send_notification_email(to="", name="", friend = "", subject = "", intName = ""):
    sender_email = os.environ.get("GMAIL_USER")
    receiver_email = to

    message = MIMEMultipart("alternative")
    message["Subject"] = "Notificacion de Intercambio"
    message["From"] = sender_email
    message["To"] = receiver_email

    html = f"""\
    <html>
    <body>
        <p>Estimado usuario {name}.</br>
        <p>Este correo es para informarle que ya se ha llevado a cabo el intercambio <b>{intName}</b> y a usted se le ha asignado la persona {friend}</p>
        { 'La persona ha elegido el tema de <b>{0}</b>'.format(subject) if subject else 'La persona no eligió tema, por lo que sientase libre de elegir algo para ella.' }
    </body>
    </html>
    """

    body = MIMEText(html, "html")

    message.attach(body)
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender_email, os.environ.get("GMAIL_PWD"))
        server.sendmail(sender_email, receiver_email, message.as_string())
        print(f"Mensaje enviado a {to}")
