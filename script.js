// =========================================
// Almanca Flashcard - script.js
// =========================================

// 1) VERİ YÜKLEME
const STORAGE_KEY = 'almanca_flashcard_v1';

let kelimeListesi = yukluVeriyiGetir();
let aktifKelimeler = [];
let aktifIndex = 0;
let aktifKategori = null;

// 2) HTML ELEMANLARI
const mainMenu = document.getElementById('main-menu');
const flashcardScreen = document.getElementById('flashcard-screen');
const cardInner = document.querySelector('.flashcard');

const cardGerman = document.getElementById('card-german');
const cardTurkish = document.getElementById('card-turkish');
const cardArtikel = document.getElementById('card-artikel');
const cardExample = document.getElementById('card-example');
const cardExampleTr = document.getElementById('card-example-tr');

const templateIsim = document.getElementById('template-isim');
const templateFiil = document.getElementById('template-fiil');
const exampleContainer = document.getElementById('example-container');

const fiilTurkish = document.getElementById('fiil-turkish');
const fiilCekimleri = document.getElementById('fiil-cekimleri');
const fiilGecmis = document.getElementById('fiil-gecmis');

const toplamKelimeEl = document.getElementById('toplam-kelime');
const btnSifirla = document.getElementById('btn-sifirla');
const biliyorumSayacEl = document.getElementById('biliyorum-sayac');
const customAlertEl = document.getElementById('custom-alert');
const btnProfilGit = document.getElementById('btn-profil-git');
const profilScreen = document.getElementById('profil-screen');
const btnProfilGeri = document.getElementById('btn-profil-geri');
const profileHeader = document.getElementById('profile-header');
const profilOgrenilenSayiEl = document.getElementById('profil-ogrenilen-sayi');
const profilKelimeListesiEl = document.getElementById('profil-kelime-listesi');

// 3) SAYFA AÇILIŞI
init();

function init() {
    butonlariBagla();
    menuIstatistikleriniGuncelle();
}

// 4) EVENTLER
function butonlariBagla() {
    document.getElementById('btn-isimler').addEventListener('click', () => oyunuBaslat('isim'));
    document.getElementById('btn-duzenli').addEventListener('click', () => oyunuBaslat('duzenli'));
    document.getElementById('btn-duzensiz').addEventListener('click', () => oyunuBaslat('duzensiz'));
    document.getElementById('btn-karisik').addEventListener('click', () => oyunuBaslat('karisik'));

    document.getElementById('btn-geri').addEventListener('click', anaMenuyeDon);


    if (btnSifirla) {
    btnSifirla.addEventListener('click', () => {
        const onay = confirm('Kart ilerlemesi sıfırlansın mı? Öğrenilen kelimeler korunacak.');
        if (!onay) return;

        uygulamaIlerlemesiniSifirla();
    });
}

    if (btnProfilGit) {
    btnProfilGit.addEventListener('click', () => {
        if (profileHeader) {
            profileHeader.style.display = 'none';
        }

        mainMenu.style.display = 'none';
        flashcardScreen.style.display = 'none';
        profilScreen.style.display = 'block';
        profilIstatistikleriniGuncelle();
    });
}

if (btnProfilGeri) {
    btnProfilGeri.addEventListener('click', () => {
        if (profileHeader) {
            profileHeader.style.display = 'flex';
        }

        profilScreen.style.display = 'none';
        flashcardScreen.style.display = 'none';
        mainMenu.style.display = 'block';
    });
}



    cardInner.addEventListener('click', () => {
        cardInner.classList.toggle('flipped');
    });

    document.querySelector('.btn-biliyorum').addEventListener('click', (e) => {
        e.stopPropagation();
        kelimeyiCevapla('biliyorum');
    });

    document.querySelector('.btn-bilmiyorum').addEventListener('click', (e) => {
        e.stopPropagation();
        kelimeyiCevapla('bilmiyorum');
    });
}

// 5) OYUNU BAŞLAT
function oyunuBaslat(secilenKategori) {
    aktifKategori = secilenKategori;
    yeniTurHazirla();
}

// 6) YENİ TUR HAZIRLA
function yeniTurHazirla() {
    let kategoriKelimeleri = kategoriyeGoreListeGetir(aktifKategori);

    if (kategoriKelimeleri.length === 0) {
        bildirimGoster('Bu kategoride henüz kelime yok!');
        anaMenuyeDon();
        return;
    }

    let bilinmeyenler = kategoriKelimeleri.filter(k => k.durum !== 'biliyorum');
    let bilinenler = kategoriKelimeleri.filter(k => k.durum === 'biliyorum');

    // Eğer kategorideki tüm kelimeler "biliyorum" olduysa sadece durumları sıfırla
    if (bilinmeyenler.length === 0 && bilinenler.length > 0) {
        kategoriKelimeleri.forEach(kelime => {
            kelime.durum = 'bilmiyorum';
        });

        verileriKaydet();
        menuIstatistikleriniGuncelle();
        bildirimGoster('Bu kategorideki tüm kelimeler bitti. Liste baştan başlatıldı.');

        kategoriKelimeleri = kategoriyeGoreListeGetir(aktifKategori);
        bilinmeyenler = kategoriKelimeleri.filter(k => k.durum !== 'biliyorum');
        bilinenler = kategoriKelimeleri.filter(k => k.durum === 'biliyorum');
    }

    karistir(bilinmeyenler);
    karistir(bilinenler);

    const secilenBilinmeyenler = bilinmeyenler.slice(0, 10);
    const secilenBilinenler = bilinenler.slice(0, 5);

    aktifKelimeler = [...secilenBilinmeyenler, ...secilenBilinenler];
    karistir(aktifKelimeler);

    if (aktifKelimeler.length === 0) {
        bildirimGoster('Gösterilecek kelime bulunamadı.');
        anaMenuyeDon();
        return;
    }

    aktifIndex = 0;

    mainMenu.style.display = 'none';
    flashcardScreen.style.display = 'block';

    kartiGoster();
}
// 7) KART GÖSTER
function kartiGoster() {
    if (aktifKelimeler.length === 0) {
        bildirimGoster('Gösterilecek kelime bulunamadı.');
        anaMenuyeDon();
        return;
    }

    // Tur bittiyse ana menüye dön
    if (aktifIndex >= aktifKelimeler.length) {
        bildirimGoster('Seans bitti!');
        setTimeout(() => {
            anaMenuyeDon();
        }, 700);
        return;
    }

    const guncelKelime = aktifKelimeler[aktifIndex];

    cardInner.classList.remove('flipped');
    cardGerman.innerText = guncelKelime.almanca || '';

    if (guncelKelime.kategori === 'duzenli' || guncelKelime.kategori === 'duzensiz') {
        fiilKartiniDoldur(guncelKelime);
    } else {
        isimKartiniDoldur(guncelKelime);
    }

    ornekCumleyiDoldur(guncelKelime);
}

// 8) İSİM KARTI
function isimKartiniDoldur(kelime) {
    templateIsim.style.display = 'flex';
    templateFiil.style.display = 'none';

    cardTurkish.innerText = kelime.turkce || '';

    if (kelime.artikel && kelime.artikel.trim() !== '') {
        cardArtikel.style.display = 'block';
        cardArtikel.innerText = kelime.artikel;
    } else {
        cardArtikel.style.display = 'none';
        cardArtikel.innerText = '';
    }
}

// 9) FİİL KARTI
function fiilKartiniDoldur(kelime) {
    templateIsim.style.display = 'none';
    templateFiil.style.display = 'flex';

    fiilTurkish.innerText = kelime.turkce || '';
    fiilGecmis.innerText = kelime.gecmis_zaman || '-';

    fiilCekimleri.innerHTML = `
        <p>${kelime.cek_ich || ''}</p>
        <p>${kelime.cek_du || ''}</p>
        <p>${kelime.cek_er || ''}</p>
        <p>${kelime.cek_wir || ''}</p>
        <p>${kelime.cek_ihr || ''}</p>
        <p>${kelime.cek_sie || ''}</p>
    `;
}

// 10) ÖRNEK CÜMLE
function ornekCumleyiDoldur(kelime) {
    const ornekVar = kelime.ornek_cumle && kelime.ornek_cumle.trim() !== '';
    const ornekTrVar = kelime.ornek_cumle_turkce && kelime.ornek_cumle_turkce.trim() !== '';

    if (ornekVar) {
        exampleContainer.style.display = 'block';
        cardExample.style.display = 'block';
        cardExample.innerText = kelime.ornek_cumle;

        if (ornekTrVar) {
            cardExampleTr.style.display = 'block';
            cardExampleTr.innerText = kelime.ornek_cumle_turkce;
        } else {
            cardExampleTr.style.display = 'none';
            cardExampleTr.innerText = '';
        }
    } else {
        exampleContainer.style.display = 'none';
        cardExample.innerText = '';
        cardExampleTr.innerText = '';
    }
}

// 11) CEVAPLA
function kelimeyiCevapla(yeniDurum) {
    if (!aktifKelimeler.length || aktifIndex >= aktifKelimeler.length) return;

    const guncelKelime = aktifKelimeler[aktifIndex];
    const listedekiKelime = kelimeListesi.find(k => k.id === guncelKelime.id);

    if (listedekiKelime) {
        listedekiKelime.durum = yeniDurum;
        listedekiKelime.ogrenildi = (yeniDurum === 'biliyorum');
    }

    verileriKaydet();
    menuIstatistikleriniGuncelle();

    aktifIndex++;

    // varsa flip animasyonu bitsin
    cardInner.classList.remove('flipped');

    setTimeout(() => {
        kartiGoster();
    }, 250);
}

// 12) ANA MENÜYE DÖN
function anaMenuyeDon() {
    aktifKategori = null;
    aktifKelimeler = [];
    aktifIndex = 0;

    cardInner.classList.remove('flipped');

    flashcardScreen.style.display = 'none';
    mainMenu.style.display = 'block';

    menuIstatistikleriniGuncelle();
}

function menuIstatistikleriniGuncelle() {
    const headerOgrenilen = document.getElementById('header-ogrenilen-sayi');

    const toplam = kelimeListesi.length;
    const biliyorumSayisi = kelimeListesi.filter(k => k.durum === 'biliyorum').length;

    if (toplamKelimeEl) {
        toplamKelimeEl.innerText = `Toplam: ${toplam}`;
    }

    if (biliyorumSayacEl) {
        biliyorumSayacEl.innerText = `${biliyorumSayisi}/${toplam}`;
    }

    const ogrenilenSayisi = kelimeListesi.filter(k => k.ogrenildi).length;

    if (headerOgrenilen) {
        headerOgrenilen.innerText = `${ogrenilenSayisi} Kelime Öğrenildi`;
    }
}

// 14) VERİ KAYDET
function verileriKaydet() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kelimeListesi));
}

// 15) VERİ YÜKLE VE GÜNCELLE
function yukluVeriyiGetir() {
    try {
        const kayitliVeri = localStorage.getItem(STORAGE_KEY);
        
        // 1. ADIM: kelimeler.js'deki ana listeyi (olası boşlukları temizleyerek) al
        const anaListe = baslangicKelimeleri.filter(k => k && k.id).map(k => ({ ...k }));

        // Eğer hiç kayıt yoksa direkt ana listeyi ver
        if (!kayitliVeri) {
            return anaListe;
        }

        const parsed = JSON.parse(kayitliVeri);

        if (!Array.isArray(parsed) || parsed.length === 0) {
            return anaListe;
        }

        // 2. ADIM: Kayıtlı verideki olası bozuk/boş elemanları temizle (Çökmeyi kesin engeller)
        let temizKayitliVeri = parsed.filter(k => k && k.id);

        // 3. ADIM: YENİ KELİMELERİ VE GÜNCELLEMELERİ BİRLEŞTİR (Merge)
        anaListe.forEach(anaKelime => {
            // Ana listedeki bu kelime, kız arkadaşının cihazında kayıtlı mı?
            const kayitliKelime = temizKayitliVeri.find(k => k.id === anaKelime.id);
            
            if (!kayitliKelime) {
                // Eğer yoksa, sen sonradan yeni kelime eklemişsin demektir. Hemen listeye ekle.
                temizKayitliVeri.push(anaKelime);
            } else {
                // Eğer varsa ilerlemesini (durum, ogrenildi) SAKLA,
                // Ama metinlerde (almanca, turkce, ornek_cumle) düzeltme yaptıysan onları GÜNCELLE.
                kayitliKelime.almanca = anaKelime.almanca;
                kayitliKelime.artikel = anaKelime.artikel;
                kayitliKelime.turkce = anaKelime.turkce;
                kayitliKelime.kategori = anaKelime.kategori;
                kayitliKelime.ornek_cumle = anaKelime.ornek_cumle;
                kayitliKelime.ornek_cumle_turkce = anaKelime.ornek_cumle_turkce;
                
                // Fiil çekimleri varsa onları da güncelle
                if (anaKelime.kategori === 'duzenli' || anaKelime.kategori === 'duzensiz') {
                    kayitliKelime.cek_ich = anaKelime.cek_ich;
                    kayitliKelime.cek_du = anaKelime.cek_du;
                    kayitliKelime.cek_er = anaKelime.cek_er;
                    kayitliKelime.cek_wir = anaKelime.cek_wir;
                    kayitliKelime.cek_ihr = anaKelime.cek_ihr;
                    kayitliKelime.cek_sie = anaKelime.cek_sie;
                    kayitliKelime.gecmis_zaman = anaKelime.gecmis_zaman;
                }
            }
        });

        return temizKayitliVeri;

    } catch (error) {
        // En kötü senaryoda (veri tamamen parçalanmışsa) çökme, sıfırdan başla
        console.error('LocalStorage verisi okunamadı. Başlangıç verisi kullanılıyor:', error);
        return baslangicKelimeleri.filter(k => k && k.id).map(k => ({ ...k }));
    }
}

// 16) KATEGORİ FİLTRESİ
function kategoriyeGoreListeGetir(kategori) {
    if (kategori === 'karisik') {
        return [...kelimeListesi];
    }

    return kelimeListesi.filter(k => k.kategori === kategori);
}

// 17) KARIŞTIR
function karistir(dizi) {
    for (let i = dizi.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dizi[i], dizi[j]] = [dizi[j], dizi[i]];
    }
    return dizi;
}

// 18) BİLDİRİM
function bildirimGoster(mesaj) {
    if (!customAlertEl) {
        alert(mesaj);
        return;
    }

    customAlertEl.innerText = mesaj;
    customAlertEl.style.display = 'block';

    clearTimeout(customAlertEl._timeoutId);
    customAlertEl._timeoutId = setTimeout(() => {
        customAlertEl.style.display = 'none';
    }, 2200);
}

function profilIstatistikleriniGuncelle() {
    if (!profilOgrenilenSayiEl || !profilKelimeListesiEl) return;

    const ogrenilenKelimeler = kelimeListesi.filter(k => k.ogrenildi);

    profilOgrenilenSayiEl.innerText = `${ogrenilenKelimeler.length} Kelime Öğrenildi`;

    profilKelimeListesiEl.innerHTML = '';

    if (ogrenilenKelimeler.length === 0) {
        profilKelimeListesiEl.innerHTML = `
            <tr>
                <td colspan="2">Henüz öğrenilen kelime yok.</td>
            </tr>
        `;
        return;
    }

    ogrenilenKelimeler.forEach(kelime => {
        profilKelimeListesiEl.innerHTML += `
            <tr>
                <td>${kelime.almanca}</td>
                <td>${kelime.turkce}</td>
            </tr>
        `;
    });
}

function uygulamaIlerlemesiniSifirla() {
    kelimeListesi.forEach(kelime => {
        kelime.durum = 'bilmiyorum';
    });

    verileriKaydet();
    menuIstatistikleriniGuncelle();
    profilIstatistikleriniGuncelle();

    aktifKelimeler = [];
    aktifIndex = 0;
    aktifKategori = null;

    cardInner.classList.remove('flipped');

    profilScreen.style.display = 'none';
    flashcardScreen.style.display = 'none';
    mainMenu.style.display = 'block';

    if (profileHeader) {
        profileHeader.style.display = 'flex';
    }

    bildirimGoster('Kart ilerlemesi sıfırlandı. Öğrenilen kelimeler korunuyor.');
}
