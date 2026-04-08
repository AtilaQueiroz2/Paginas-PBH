/* =============================================
   JORNADA PRODUTIVA - JavaScript para Gavias Builder
   Cole este conteúdo no bloco "Custom Text" > SCRIPT
   ============================================= */

// --- Carrossel de Imagens (Sobre o Programa) ---
(function() {
    const carrosselImagens = [
        "carrinho-de-pipoca.jpg",
        "img_7360.JPG", "img_7376.JPG", "img_7385.JPG", "img_7395.JPG",
        "img_7401.JPG", "img_7410.JPG", "img_7421.JPG", "img_7431.JPG",
        "img_7443.JPG", "img_7445.JPG", "img_7450.JPG", "img_7456-1.JPG",
        "img_7462-1.JPG", "img_7464.JPG", "img_7466.JPG", "img_7471.JPG",
        "img_7488.JPG", "img_7495.JPG", "img_7498.JPG", "img_7506.JPG",
        "img_7508.JPG", "img_7515.JPG"
    ];
    const track = document.getElementById("about-carousel-track");
    const appendImages = () => {
        carrosselImagens.forEach(img => {
            const div = document.createElement("div");
            div.className = "carousel-item";
            const imgEl = document.createElement("img");
            imgEl.src = "https://prefeitura.pbh.gov.br/sites/default/files/estrutura-de-governo/politica-urbana/Jornada%20Produtiva/Carrocel/" + img;
            imgEl.alt = "Jornada Produtiva - Imagem da Feira";
            imgEl.loading = "lazy";
            imgEl.classList.add("expandable-image");
            div.appendChild(imgEl);
            track.appendChild(div);
        });
    };
    if (track) {
        appendImages();
        appendImages();
    }
})();

// --- Tab Switching (Avisos / Editais) ---
document.querySelectorAll('.news-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        document.getElementById('tab-' + target).classList.add('active');
    });
});

// --- Accordion Functionality ---
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isOpen = item.classList.contains('active');
        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
            const otherBtn = i.querySelector('.accordion-header');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
            item.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
        }
    });
});

// --- News Filter (Show More) ---
const btnShowAllNews = document.getElementById('btn-show-all-news');
const newsContainer = document.getElementById('news-accordion-container');
if (btnShowAllNews && newsContainer) {
    btnShowAllNews.addEventListener('click', () => {
        newsContainer.classList.remove('news-collapsed');
        btnShowAllNews.parentElement.classList.add('hidden');
    });
}

// --- FAQ Filter (Show More / Show Less) ---
const btnShowAllFaq = document.getElementById('btn-show-all-faq');
const faqContainer = document.getElementById('faq-accordion-container');
if (btnShowAllFaq && faqContainer) {
    btnShowAllFaq.addEventListener('click', () => {
        const isCollapsed = faqContainer.classList.contains('faq-collapsed');
        if (isCollapsed) {
            faqContainer.classList.remove('faq-collapsed');
            btnShowAllFaq.textContent = 'Ver menos';
        } else {
            faqContainer.classList.add('faq-collapsed');
            btnShowAllFaq.textContent = 'Ver mais';
            document.getElementById('faq').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// --- Timeline Scroll Animation ---
const timeline = document.querySelector('.timeline');
if (timeline) {
    const updateTimeline = () => {
        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const startPoint = windowHeight * 0.6;
        const lastItem = timeline.querySelector('.timeline-item:last-child');
        const lineMaxHeight = lastItem ? lastItem.offsetTop + 56 : rect.height;
        timeline.style.setProperty('--line-max-height', `${lineMaxHeight}px`);
        if (rect.top <= startPoint) {
            const scrolledHeight = startPoint - rect.top;
            const currentLineHeight = Math.max(0, Math.min(lineMaxHeight, scrolledHeight));
            timeline.style.setProperty('--line-height', `${currentLineHeight}px`);
        } else {
            timeline.style.setProperty('--line-height', `0px`);
        }
    };
    window.addEventListener('scroll', updateTimeline);
    window.addEventListener('resize', updateTimeline);
    setTimeout(updateTimeline, 100);
}

// --- Lightbox Functionality ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const expandableImages = document.querySelectorAll('.expandable-image');
expandableImages.forEach(img => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});
const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
            lightboxImg.src = '';
        }
    }, 300);
};
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) {
        closeLightbox();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

// --- Print Button ---
const lightboxPrint = document.getElementById('lightbox-print');
if (lightboxPrint) {
    lightboxPrint.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = lightboxImg.src;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>Fluxograma dos Editais</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}img{max-width:100%;height:auto}</style></head><body><img src="${src}" onload="window.print();window.close();"></body></html>`);
        printWindow.document.close();
    });
}

// --- Counter Animation ---
const animateCounters = () => {
    const counters = document.querySelectorAll('.animate-counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const format = counter.getAttribute('data-format');
        const duration = 2000;
        const startTime = performance.now();
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentCount = Math.floor(progress * target);
            if (format === "3.400+") {
                counter.innerText = currentCount.toLocaleString('pt-BR') + "+";
            } else if (format === "09") {
                counter.innerText = currentCount.toString().padStart(2, '0');
            } else {
                counter.innerText = currentCount;
            }
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = format;
            }
        };
        requestAnimationFrame(updateCount);
    });
};
window.addEventListener('load', animateCounters);
