        function expandImage(event) {
            event.stopPropagation();
            const item = event.currentTarget;
            item.classList.add('expanded');
            document.getElementById('modalOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeImage() {
            document.querySelectorAll('.gallery-item.expanded').forEach(item => {
                item.classList.remove('expanded');
            });
            document.getElementById('modalOverlay').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        document.addEventListener('DOMContentLoaded', () => {
            const overlay = document.getElementById('modalOverlay');
            overlay.addEventListener('click', closeImage);

            // Inchide cu butonul Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeImage();
                }
            });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.product-card, .gallery-item').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });