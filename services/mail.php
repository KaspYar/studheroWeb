<?php
    header("Access-Control-Allow-Origin: *");
    require_once 'libmail.php';
    
    $name = $_POST['name'];
    $email = $_POST['email'];
    $body = $_POST['text'];
    //$to = "tochitskiy@mail.ua";
    $to = "studhero.ua@gmail.com";
    $subject = "Відгук з сайту StudHero"; 
    $message = ' 
    <html> 
        <head> 
            <title>STUDHERO</title> 
        </head> 
        <body> 
           '. "<b>Користувач: </b>".$name."<br/>"
            . "<b>Email: </b>".$email."<br/>"
            . "<b>Повідомлення: </b><br/>".$body.'
        </body> 
    </html>'; 

    $headers  = "Content-type: text/html; charset=utf-8 \r\n"; 
    $headers .= "From: ".$email."\r\n"; 

    mail($to, $subject, $message, $headers);
   
 
?>

