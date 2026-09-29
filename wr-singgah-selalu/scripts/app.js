// menu bawaan kalau belum pernah menyimpan apa pun
const menuAwal = {
  catering: [],
  prasmanan: [],
  resto: [
    { nama: "Nasi", harga: 5000, foto: "" },
    { nama: "Telur", harga: 3000, foto: "" }
  ]
};

// ambil menu yang tersimpan di browser; kalau belum ada, pakai menu bawaan
const tersimpan = localStorage.getItem("menuWarung");
const menu = tersimpan ? JSON.parse(tersimpan) : menuAwal;

// simpan menu ke browser supaya tidak hilang saat refresh
function simpanMenu() {
  localStorage.setItem("menuWarung", JSON.stringify(menu));
}

let kategoriAktif = "catering";
let fotoSementara = "";
let indexEdit = -1;

const halamanKasir = document.getElementById("halamanKasir");
const halamanEdit = document.getElementById("halamanEdit");
const daftarMenu = document.getElementById("daftarMenu");
const judulForm = document.getElementById("judulForm");
const inputFoto = document.getElementById("inputFoto");
const previewFoto = document.getElementById("previewFoto");
const inputNama = document.getElementById("inputNama");
const inputHarga = document.getElementById("inputHarga");
const tombolHapus = document.getElementById("tombolHapus");


function rupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function hanyaAngka(teks) {
  return teks.replace(/\D/g, "");
}

// titik ribuan muncul otomatis saat mengetik
inputHarga.oninput = function () {
  const angka = hanyaAngka(inputHarga.value);
  inputHarga.value = angka === "" ? "" : Number(angka).toLocaleString("id-ID");
};

function tampilkanMenu() {
  daftarMenu.innerHTML = "";

  menu[kategoriAktif].forEach(function (item, i) {
    const kartu = document.createElement("div");
    kartu.className = "kartu";
    kartu.innerHTML =
      '<div class="area-foto">' +
        (item.foto ? '<img src="' + item.foto + '" alt="">' : '') +
      '</div>' +
      '<div class="baris-nama">' +
        '<p class="nama">' + item.nama + '</p>' +
        '<button class="tambah">+</button>' +
      '</div>' +
      '<p class="harga">' + rupiah(item.harga) + '</p>';

    kartu.onclick = function (e) {
      if (e.target.classList.contains("tambah")) {
        tambahKePesanan(item);
        return;
      }
      bukaEdit(i);
    };

    daftarMenu.appendChild(kartu);
  });

  const slot = document.createElement("button");
  slot.className = "kartu slot-tambah";
  slot.textContent = "+";
  slot.onclick = function () { bukaEdit(-1); };
  daftarMenu.appendChild(slot);
}

function bukaEdit(i) {
  indexEdit = i;

  if (i === -1) {
    judulForm.textContent = "Tambah Menu";
    inputNama.value = "";
    inputHarga.value = "";
    previewFoto.src = "";
    fotoSementara = "";
    tombolHapus.style.display = "none";
  } else {
    const item = menu[kategoriAktif][i];
    judulForm.textContent = "Edit Menu";
    inputNama.value = item.nama;
    inputHarga.value = item.harga.toLocaleString("id-ID");
    previewFoto.src = item.foto;
    fotoSementara = item.foto;
    tombolHapus.style.display = "block";
  }

  halamanKasir.classList.add("sembunyi");
  halamanEdit.classList.remove("sembunyi");
}

function tutupEdit() {
  halamanEdit.classList.add("sembunyi");
  halamanKasir.classList.remove("sembunyi");
  indexEdit = -1;
}

inputFoto.onchange = function () {
  const berkas = inputFoto.files[0];
  if (!berkas) return;

  const pembaca = new FileReader();
  pembaca.onload = function () {
    fotoSementara = pembaca.result;
    previewFoto.src = fotoSementara;
  };
  pembaca.readAsDataURL(berkas);
};

document.getElementById("tombolBatal").onclick = tutupEdit;
document.getElementById("tombolBack").onclick = tutupEdit;

document.getElementById("tombolSimpan").onclick = function () {
  const nama = inputNama.value.trim();
  const harga = Number(hanyaAngka(inputHarga.value));

  if (nama === "" || harga <= 0) {
    alert("Nama dan harga harus diisi");
    return;
  }

  const data = { nama: nama, harga: harga, foto: fotoSementara };

  if (indexEdit === -1) {
    menu[kategoriAktif].push(data);
  } else {
    menu[kategoriAktif][indexEdit] = data;
  }

  simpanMenu();
  tutupEdit();
  tampilkanMenu();
};

tombolHapus.onclick = function () {
  if (!confirm("Hapus menu ini?")) return;
  menu[kategoriAktif].splice(indexEdit, 1);
  simpanMenu();
  tutupEdit();
  tampilkanMenu();
};

document.querySelectorAll(".tab").forEach(function (tab) {
  tab.onclick = function () {
    document.querySelector(".tab.aktif").classList.remove("aktif");
    tab.classList.add("aktif");
    kategoriAktif = tab.dataset.kategori;
    tampilkanMenu();
  };
});

// ===== PESANAN =====

let pesanan = [];

const isiPesanan = document.getElementById("isiPesanan");
const totalHarga = document.getElementById("totalHarga");

function tambahKePesanan(item) {
  const sudahAda = pesanan.find(function (p) {
    return p.nama === item.nama && p.harga === item.harga;
  });

  if (sudahAda) {
    sudahAda.jumlah = sudahAda.jumlah + 1;
  } else {
    pesanan.push({ nama: item.nama, harga: item.harga, jumlah: 1 });
  }

  tampilkanPesanan();
}

function kurangiPesanan(i) {
  pesanan[i].jumlah = pesanan[i].jumlah - 1;
  if (pesanan[i].jumlah === 0) {
    pesanan.splice(i, 1);
  }
  tampilkanPesanan();
}

function hapusPesanan(i) {
  pesanan.splice(i, 1);
  tampilkanPesanan();
}

function tampilkanPesanan() {
  isiPesanan.innerHTML = "";

  if (pesanan.length === 0) {
    isiPesanan.innerHTML = '<p class="kosong">Belum ada pesanan</p>';
    totalHarga.textContent = "Rp 0";
    return;
  }

  let total = 0;

  pesanan.forEach(function (p, i) {
    total = total + p.harga * p.jumlah;

    const baris = document.createElement("div");
    baris.className = "baris-pesanan";
    baris.innerHTML =
      '<div class="pesanan-kiri">' +
        '<p class="pesanan-nama">' + p.nama + '</p>' +
        '<p class="pesanan-subtotal">' + rupiah(p.harga * p.jumlah) + '</p>' +
      '</div>' +
      '<div class="pesanan-kanan">' +
        '<button class="kurang">−</button>' +
        '<span class="jumlah">' + p.jumlah + '</span>' +
        '<button class="tambah-kecil">+</button>' +
        '<button class="hapus-item">✕</button>' +
      '</div>';

    baris.querySelector(".kurang").onclick = function () { kurangiPesanan(i); };
    baris.querySelector(".tambah-kecil").onclick = function () {
      pesanan[i].jumlah = pesanan[i].jumlah + 1;
      tampilkanPesanan();
    };
    baris.querySelector(".hapus-item").onclick = function () { hapusPesanan(i); };

    isiPesanan.appendChild(baris);
  });

  totalHarga.textContent = rupiah(total);
}

tampilkanMenu();
tampilkanPesanan();