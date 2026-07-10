import pygame
import random
import sys
import os
from gtts import gTTS

# --- 1. INISIALISASI & CONFIGURATION ---
pygame.init()
pygame.mixer.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Game Tebak Kata Dunia")
clock = pygame.time.Clock()

# Warna
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
ORANGE = (255, 165, 0)

# Font
FONT_LARGE = pygame.font.SysFont("Arial", 50, bold=True)
FONT_MEDIUM = pygame.font.SysFont("Arial", 32)
FONT_SMALL = pygame.font.SysFont("Arial", 24)

# --- 2. GENERATE AUDIO DENGAN gTTS ---
def buat_suara(teks, nama_file):
    if not os.path.exists(nama_file):
        try:
            tts = gTTS(text=teks, lang='id')
            tts.save(nama_file)
        except Exception as e:
            print(f"Gagal membuat audio {nama_file}: {e}")

# Buat file audio jika belum ada
buat_suara("Kamu menang!", "menang.mp3")
buat_suara("Kamu payah, jawabanmu salah!", "kalah.mp3")

def putar_suara(nama_file):
    try:
        pygame.mixer.music.load(nama_file)
        pygame.mixer.music.play()
    except Exception as e:
        print(f"Gagal memutar audio: {e}")

# --- 3. DATA KATA ACAK INTERNASIONAL ---
# Kumpulan kata dari berbagai kategori di dunia
KATA_DUNIA = [
    "INDONESIA", "PARIS", "EIFEL", "AMAZON", "SAHARA", 
    "PYRAMID", "FUJI", "LONDON", "TOKYO", "NEWYORK", 
    "HIMALAYA", "KANGAROO", "PANDA", "SPAGHETTI", "CROISSANT"
]

def pilih_kata_baru():
    kata = random.choice(KATA_DUNIA)
    # Acak hurufnya untuk petunjuk
    huruf_acak = list(kata)
    random.shuffle(huruf_acak)
    kata_acak = " ".join(huruf_acak)
    return kata, kata_acak

# --- 4. MEMBUAT BACKGROUND PEPOHONAN BERGERAK (PARALLAX EFFECT) ---
# Menggunakan lingkaran dan persegi panjang terprogram agar menyerupai hutan/pohon nyata yang bergerak lambat
class Pohon:
    def __init__(self, x, speed, scale):
        self.x = x
        self.speed = speed
        self.scale = scale
        self.y = 350

    def update(self):
        self.x -= self.speed
        if self.x < -150:
            self.x = SCREEN_WIDTH + random.randint(0, 100)

    def draw(self, surface):
        # Batang Pohon
        pygame.draw.rect(surface, (101, 67, 33), (self.x + int(40*self.scale), self.y + int(100*self.scale), int(20*self.scale), int(150*self.scale)))
        # Daun (Beberapa lapisan hijau agar terlihat lebih realistik)
        pygame.draw.circle(surface, (34, 139, 34), (self.x + int(50*self.scale), self.y + int(100*self.scale)), int(50*self.scale))
        pygame.draw.circle(surface, (46, 139, 87), (self.x + int(30*self.scale), self.y + int(80*self.scale)), int(40*self.scale))
        pygame.draw.circle(surface, (0, 100, 0), (self.x + int(70*self.scale), self.y + int(80*self.scale)), int(40*self.scale))

# Inisialisasi deretan pohon di background
list_pohon = [
    Pohon(100, 0.5, 0.8),
    Pohon(350, 0.7, 1.2),
    Pohon(600, 0.4, 0.9),
    Pohon(850, 0.6, 1.1)
]

# --- 5. GAME STATE & LOOP UTAMA ---
kata_target, clue_acak = pilih_kata_baru()
input_user = ""
status_teks = ""
status_warna = WHITE

running = True
while running:
    # Menggambar Langit & Tanah
    screen.fill((135, 206, 235)) # Langit Biru
    pygame.draw.rect(screen, (34, 139, 34), (0, 450, SCREEN_WIDTH, 150)) # Tanah Hijau

    # Update dan Gambar Background Pepohonan Bergerak
    for pohon in list_pohon:
        pohon.update()
        pohon.draw(screen)

    # Event Handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
            elif event.key == pygame.K_BACKSPACE:
                input_user = input_user[:-1]
            elif event.key == pygame.K_RETURN:
                # Cek Jawaban saat tekan Enter
                if input_user.upper() == kata_target:
                    status_teks = "KAMU MENANG!"
                    status_warna = GREEN
                    putar_suara("menang.mp3")
                    # Ganti kata setelah tebakan benar
                    pygame.time.wait(1000) 
                    kata_target, clue_acak = pilih_kata_baru()
                    input_user = ""
                else:
                    status_teks = "KAMU PAYAH JAWABANMU SALAH!"
                    status_warna = RED
                    putar_suara("kalah.mp3")
                    input_user = ""
            else:
                # Batasi input hanya huruf dan panjang sesuai kata
                if event.unicode.isalpha() and len(input_user) < len(kata_target):
                    input_user += event.unicode.upper()

    # --- UI RENDERING ---
    # Overlay semi-transparan untuk kotak teks agar mudah dibaca
    overlay = pygame.Surface((700, 300), pygame.SRCALPHA)
    overlay.fill((0, 0, 0, 180)) # Hitam transparan
    screen.blit(overlay, (50, 50))

    # Teks Petunjuk / Huruf Acak
    txt_clue = FONT_MEDIUM.render(f"Susun Huruf Ini: {clue_acak}", True, ORANGE)
    screen.blit(txt_clue, (80, 80))

    # Teks Input User
    txt_input = FONT_LARGE.render(f"Jawaban: {input_user}", True, WHITE)
    screen.blit(txt_input, (80, 150))

    # Status Menang / Salah
    txt_status = FONT_SMALL.render(status_teks, True, status_warna)
    screen.blit(txt_status, (80, 240))

    # Instruksi bawah
    txt_info = FONT_SMALL.render("Tekan ENTER untuk cek jawaban | ESC untuk keluar", True, WHITE)
    screen.blit(txt_info, (50, 560))

    pygame.display.flip()
    clock.tick(60) # 60 FPS

pygame.quit()
sys.exit()
