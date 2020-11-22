$().ready (() => {
    let astys = {};

    // haetaan asiakastyypit
    $.get({
        url: "http://127.0.0.1:3002/Types",
        success: (result) => {
            console.log(result);
            astys = result;
            result.forEach((r) => {
                let optstr = `<option value="${r.avain}">${r.lyhenne + " " + r.selite}</option>`;
                $('#custType').append(optstr);
                $('#custCustType').append(optstr);
            });
        }
    });

    // haetaan data
    fetch = () => {
        let sp = searcParameters();
        $.get({
            url: `http://127.0.0.1:3002/Customer?${sp}`,
            success: (result) => {
                showResultInTable(result, astys);
        }});
    }

    // bindataan click-event
    $('#searchBtn').click(() => {
        fetch();
    });

    // otetaan kaikki asiakaanlisäysformin elementit yhteen muuttujaan
    let allFields = $([])
        .add($('#custName'))
        .add($('#custAddress'))
        .add($('#custPostNbr'))
        .add($('#custPostOff'))
        .add($('#custCustType'));

    // luodaan asiakkaanlisäysdialogi
    let dialog = $('#addCustDialog').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        minWidth: 400,
        width: 'auto',
        close: function() {
            form[0].reset();
            allFields.removeClass("ui-state-error");
        }
    });

    // luodaan formi asiakasLISÄYSdialogille
    let form = dialog.find("form")
        .on("submit", (event) => {
            event.preventDefault();
            if (validateAddCust(form)) {
                let param = dialog.find("form").serialize();
                addCust(param);
            }
        }
    );

        // tekee post-kutsun palvelimelle ja vastauksen saatuaan jatkaa
    addCust = (param) => {
        $.post("http://127.0.0.1:3002/Customer/", param)
            .then((data) => {
                showAddCustStat(data);
                $('#addCustDialog').dialog("close");
                fetch();
            });
    }

    // näyttää lisäyksen onnistumisen tai epäonnistumisen
    showAddCustStat = (data) => {
        if (data.status == 'ok') {
            $('#addStatus').css("color", "green").text("Asiakkaan lisääminen onnistui")
            .show().fadeOut(6000);
        } else {
            $('#addStatus').css("color", "red").text("Lisäämisessä tapahtui virhe: " + data.status_text).show();
        }
    }

    /*
    // avataan asiakkaanmuokkausdialogi jos sitä ei ole jo avattu
    $('#editCustBtn').click(() => {
        const isOpen = $('#editCustDialog').dialog("isOpen");
        if (!isOpen) {
            $('#editCustDialog').dialog("open");
        }
    });
    */

    // avataan asiakkaanlisäysdialogi jos sitä ei ole jo avattu
    $('#addCustBtn').click(() => {
        const isOpen = $('#addCustDialog').dialog("isOpen");
        if (!isOpen) {
            $('#addCustDialog').dialog("open");
        }
    });
});

// tarkistaa onko dialogin kentät täytetty ja näyttää varoitukset jos ei
validateAddCust = (form) => {
    let inputs = form.find('input');
    let valid = true;
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == '') {
            inputs[i].classList.toggle("ui-state-error", true);
            valid = false;
        } else {
            inputs[i].classList.toggle("ui-state-error", false);
        }
    }
    if (form.find('select')[0].value === 'empty') {
        form.find('select')[0].classList.toggle("ui-state-error", true);
        valid = false;
    } else {
        form.find('select')[0].classList.toggle("ui-state-error", false);
    }
    if (valid) {
        $('#warning').hide();
        return true;
    }
    $('#warning').show();
    return false;
}

// palauttaa hakuparametri-stringin jos kentät eivät ole tyhjiä
searcParameters = () => {
    let str = '';
    if ($('#name').val().trim() != '') {
        let name = $('#name').val().trim();
        str += `nimi=${name}`;
    }
    if ($('#address').val().trim() != '') {
        let address = $('#address').val().trim();
        if (str !== '') {
            str += '&';
        }
        str += `osoite=${address}`;
    }
    if ($('#custType').val() !== null) {
        let custType = $('#custType').val();
        if (str !== '') {
            str += '&';
        }
        str+=`asty_avain=${custType}`;
    }
    return str;
}

// tyhjentää data-tablen ja tuo haun tuloksen tableen
showResultInTable = (result, astys) => {
    $('#data tbody').empty();
    console.log(astys);
    result.forEach(element => {
        let trstr = "<tr><td>" + element.nimi + "</td>\n";
        trstr += "<td>" + element.osoite + "</td>\n";
        trstr += "<td>" + element.postinro + "</td>\n";
        trstr += "<td>" + element.postitmp + "</td>\n";
        trstr += "<td>" + element.luontipvm + "</td>\n";
        astys.forEach((asty) => {
            if (asty.avain === element.asty_avain) {
                trstr += "<td>" + asty.selite + "</td>";
            }
        });
        console.log(element);
        let avain=element.avain;
        trstr += `<td><button onclick="deleteCustomer(${avain});" class="deleteBtn">Poista</button></td>`; // poista-nappi
        trstr += `<td><button onclick="updateCustomer(${avain}​​​​);" class="muokkausNappula​​​​">Muokkaa</button></td>`; // muokkaa-nappi
        trstr += "</tr>\n";
        $('#data tbody').append(trstr);
    });
}

// muokataan asiakasta
updateCustomer = (key) => {
    if (isNaN(key)) {
        return;
    }
    console.log("Täällä ollaan :)");   
    const isOpen = $('#addCustDialog').dialog("isOpen");
    if (!isOpen) {
        $('#addCustDialog').dialog("open");
    }
    
}

// poistetaan asiakas
deleteCustomer = (key) => {
    if (isNaN(key)) {
        return;
    }
    $.ajax({
        url: `http://127.0.0.1:3002/Customer/${key}`,
        type: 'DELETE',
        success: (result) => {
            fetch();
        }
    });
}