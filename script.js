```javascript
/******************************************************
 * GANTI URL DI BAWAH DENGAN URL WEB APP APPS SCRIPT
 ******************************************************/

const API_URL =
    "https://script.google.com/macros/s/AKfycbxb9-4Jpo9d_PIrSqnLuioEF74p3kO8Ga_gVBwkUnFpZ9lm1jGTWcoVpm9gVga-0u4H/exec
";


/* =========================================
   JSONP
========================================= */

function apiRequest(params, callback) {

    const callbackName =
        "jsonp_" +
        Date.now() +
        "_" +
        Math.floor(Math.random() * 10000);

    window[callbackName] = function(data) {

        delete window[callbackName];

        const script =
            document.getElementById(callbackName);

        if (script) {
            script.remove();
        }

        callback(data);

    };

    const query =
        new URLSearchParams(params);

    query.set(
        "callback",
        callbackName
    );

    const script =
        document.createElement("script");

    script.id = callbackName;

    script.src =
        API_URL + "?" + query.toString();

    script.onerror = function() {

        delete window[callbackName];

        const message =
            document.getElementById("message");

        if (message) {
            message.textContent =
                "Gagal terhubung ke server.";
        }

    };

    document.body.appendChild(script);
}


/* =========================================
   LOGIN
========================================= */

function login() {

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    if (!password) {

        message.textContent =
            "Password harus diisi.";

        return;

    }

    message.textContent =
        "Memeriksa password...";

    apiRequest(
        {
            action: "login",
            password: password
        },

        function(result) {

            if (result.success) {

                sessionStorage.setItem(
                    "donatur_token",
                    result.token
                );

                location.href =
                    "form.html";

            } else {

                message.textContent =
                    result.message;

                document.getElementById(
                    "password"
                ).value = "";

            }

        }
    );
}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    sessionStorage.removeItem(
        "donatur_token"
    );

    location.href =
        "index.html";
}


/* =========================================
   CEK LOGIN
========================================= */

function checkLogin() {

    const token =
        sessionStorage.getItem(
            "donatur_token"
        );

    if (!token) {

        location.href =
            "login.html";

    }

}


/* =========================================
   TANGGAL
========================================= */

function tampilkanTanggal() {

    const sekarang =
        new Date();

    const hari =
        String(
            sekarang.getDate()
        ).padStart(2, "0");

    const bulan =
        String(
            sekarang.getMonth() + 1
        ).padStart(2, "0");

    const tahun =
        sekarang.getFullYear();

    const el =
        document.getElementById(
            "tanggal"
        );

    if (el) {

        el.value =
            hari + "/" +
            bulan + "/" +
            tahun;

    }

}


/* =========================================
   RT
========================================= */

let selectedRT = "";

function pilihRT(rt) {

    selectedRT = rt;

    for (
        let i = 1;
        i <= 6;
        i++
    ) {

        const el =
            document.getElementById(
                "rt" +
                String(i).padStart(2, "0")
            );

        if (el) {
            el.classList.remove(
                "selected"
            );
        }

    }

    document.getElementById(
        "rt" + rt
    ).classList.add(
        "selected"
    );
}


/* =========================================
   FORMAT RUPIAH INPUT
========================================= */

function formatInputRupiah(input) {

    let value =
        input.value.replace(
            /[^0-9]/g,
            ""
        );

    if (!value) {

        input.value = "";

        return;

    }

    value =
        parseInt(
            value,
            10
        ).toLocaleString(
            "id-ID"
        );

    input.value =
        "Rp " + value;
}


function getNominal(input) {

    return Number(
        input.replace(
            /[^0-9]/g,
            ""
        )
    ) || 0;

}


/* =========================================
   SIMPAN
========================================= */

function simpan() {

    checkLogin();

    const nama =
        document.getElementById(
            "nama"
        ).value.trim();

    const jumlahText =
        document.getElementById(
            "jumlah"
        ).value;

    const jumlah =
        getNominal(
            jumlahText
        );

    const message =
        document.getElementById(
            "formMessage"
        );


    if (!nama) {

        message.textContent =
            "Nama donatur belum diisi.";

        return;

    }

    if (!selectedRT) {

        message.textContent =
            "Silakan pilih RT.";

        return;

    }

    if (!jumlah || jumlah <= 0) {

        message.textContent =
            "Jumlah donasi belum diisi.";

        return;

    }


    message.textContent =
        "Menyimpan data...";


    const token =
        sessionStorage.getItem(
            "donatur_token"
        );


    apiRequest(
        {
            action: "save",
            token: token,
            nama: nama,
            rt: selectedRT,
            jumlah: jumlah
        },

        function(result) {

            if (result.success) {

                document.getElementById(
                    "nomor"
                ).value =
                    result.nomor;

                message.textContent =
                    result.message;

                document.getElementById(
                    "nama"
                ).value = "";

                document.getElementById(
                    "jumlah"
                ).value = "";

                selectedRT = "";

                for (
                    let i = 1;
                    i <= 6;
                    i++
                ) {

                    const el =
                        document.getElementById(
                            "rt" +
                            String(i).padStart(2, "0")
                        );

                    if (el) {
                        el.classList.remove(
                            "selected"
                        );
                    }

                }

                document.getElementById(
                    "formTotal"
                ).textContent =
                    formatRupiah(
                        result.total
                    );

                tampilkanTanggal();

                document.getElementById(
                    "nama"
                ).focus();

            } else {

                message.textContent =
                    result.message;

                if (
                    result.message.includes(
                        "sesi"
                    )
                ) {

                    sessionStorage.removeItem(
                        "donatur_token"
                    );

                    setTimeout(
                        function() {
                            location.href =
                                "login.html";
                        },
                        1500
                    );

                }

            }

        }
    );
}


/* =========================================
   TOTAL DANA
========================================= */

function ambilTotal() {

    apiRequest(
        {
            action: "total"
        },

        function(result) {

            if (result.success) {

                const el =
                    document.getElementById(
                        "formTotal"
                    );

                if (el) {

                    el.textContent =
                        formatRupiah(
                            result.total
                        );

                }

            }

        }
    );
}


/* =========================================
   FORMAT RUPIAH
========================================= */

function formatRupiah(angka) {

    return "Rp " +
        Number(
            angka || 0
        ).toLocaleString(
            "id-ID"
        );

}


/* =========================================
   JAM DISPLAY
========================================= */

function updateClock() {

    const now =
        new Date();

    const hari =
        String(
            now.getDate()
        ).padStart(2, "0");

    const bulanNama = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    const bulan =
        bulanNama[
            now.getMonth()
        ];

    const tahun =
        now.getFullYear();

    let jam =
        String(
            now.getHours()
        ).padStart(2, "0");

    let menit =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    let detik =
        String(
            now.getSeconds()
        ).padStart(2, "0");


    const dateEl =
        document.getElementById(
            "displayDate"
        );

    const timeEl =
        document.getElementById(
            "displayTime"
        );


    if (dateEl) {

        dateEl.textContent =
            hari + " " +
            bulan + " " +
            tahun;

    }

    if (timeEl) {

        timeEl.textContent =
            jam + ":" +
            menit + ":" +
            detik +
            " WIB";

    }

}


/* =========================================
   DISPLAY DATA DONATUR
========================================= */

function loadDisplayData() {

    apiRequest(
        {
            action: "data"
        },

        function(result) {

            if (!result.success) {
                return;
            }


            const totalEl =
                document.getElementById(
                    "displayTotal"
                );

            if (totalEl) {

                totalEl.textContent =
                    formatRupiah(
                        result.total
                    );

            }


            tampilkanDonatur(
                result.data
            );

        }
    );

}


/* =========================================
   ANIMASI DONATUR
========================================= */

function tampilkanDonatur(data) {

    const container =
        document.getElementById(
            "donaturList"
        );

    if (!container) return;


    container.innerHTML = "";


    // Data terbaru diutamakan
    const terbaru =
        data
        .slice()
        .reverse();


    // Batasi data agar tidak terlalu berat
    const daftar =
        terbaru.slice(
            0,
            30
        );


    daftar.forEach(
        function(item, index) {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "donatur-item";


            div.style.animationDelay =
                (index * 1.2) + "s";


            div.innerHTML = `

                <div class="donatur-line">

                    <span>
                        #${item.nomor}
                    </span>

                    <span>
                        ${item.tanggal}
                    </span>

                    <span>
                        RT ${item.rt}
                    </span>

                </div>

                <div class="donatur-name">

                    ${escapeHTML(item.nama)}

                </div>

                <div class="donatur-money">

                    ${formatRupiah(item.jumlah)}

                </div>

            `;


            container.appendChild(
                div
            );

        }
    );

}


/* =========================================
   KEAMANAN TAMPILAN NAMA
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================
   DISPLAY DATA
========================================= */

function loadDisplayData() {

    apiRequest(
        {
            action: "data"
        },

        function(result) {

            if (!result.success) {
                return;
            }

            const totalEl =
                document.getElementById(
                    "displayTotal"
                );

            if (totalEl) {

                totalEl.textContent =
                    formatRupiah(
                        result.total
                    );

            }

            tampilkanDonatur(
                result.data
            );

        }
    );

}
```
