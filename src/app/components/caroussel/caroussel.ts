/**
 * Composant Carousel
 * Affiche un carrousel d'images sur la page d'accueil
 */
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

declare var $: any;

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './caroussel.html',
  styleUrl: './caroussel.css'
})
export class Carousel implements OnInit, AfterViewInit {
  private carouselInitialized = false;

  ngOnInit(): void {
    // Précharger les images immédiatement
    this.preloadImages([
      'banner1.jpg',
      'banner2.jpg',
      'banner3.jpg'
    ]);
  }

  ngAfterViewInit(): void {
    // Attendre que jQuery et owlCarousel soient disponibles
    this.waitForOwlCarousel().then(() => {
      this.initializeCarousel();
    });
  }

  private waitForOwlCarousel(): Promise<void> {
    return new Promise((resolve) => {
      const checkOwl = () => {
        if (typeof $ !== 'undefined' && $.fn && $.fn.owlCarousel) {
          resolve();
        } else {
          setTimeout(checkOwl, 50);
        }
      };
      checkOwl();
    });
  }

  private preloadImages(imageUrls: string[]): void {
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  private initializeCarousel(): void {
    if (this.carouselInitialized) return;

    const $carousel = $('.owl-introSlider');
    if ($carousel.length === 0) {
      console.warn('⚠️ Élément carousel non trouvé');
      return;
    }

    try {
      $carousel.owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        nav: false,
        dots: true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 450,
        lazyLoad: false
      });
      this.carouselInitialized = true;
      console.log('✅ Carousel initialisé');
    } catch (error) {
      console.error('❌ Erreur carousel:', error);
    }
  }
}
