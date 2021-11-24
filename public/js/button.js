
// ***Seleciono todos los audios***
let misAudios = document.querySelectorAll(".audios");
// ***Selecciono todos los botones***
let buttons = document.querySelectorAll('.button');

let titles = document.querySelectorAll('.button h3');
// ***Repaso por cada botón***
buttons.forEach(button => {
    // ***Si se clickea X botón, activa la función***
    button.addEventListener('click', function () {
        // ***Repasa los audios***
        misAudios.forEach(miAudio => {
            // ***Verifica si el id del botón presionado coincide con el id del audio
            if (button.id == miAudio.id) {
                //console.log('Seleccionó el audio ' + miAudio.src);
                let sound = true;
                if (sound) {
                    //console.log(titles);
                    let title = titles[button.id];
                    let aux = title.innerText
                    console.log(title);
                    miAudio.volume = 0.7;
                    miAudio.play();
                    button.classList.add('button-pressed');
                    miAudio.addEventListener('play', function () {
                        title.innerText = 'reproduciendo...';
                        console.log('reproduciendo');
                    })

                    miAudio.addEventListener('ended', function () {
                        //console.log('Termino de reproducirse');
                        button.classList.remove('button-pressed');
                        title.innerText = aux;
                    })
                }
            }
        })
    })
})

