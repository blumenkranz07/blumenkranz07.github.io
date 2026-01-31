import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, ViewportScroller } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var data: any;

@Component({
	selector: 'app-project-detail',
	templateUrl: './project-detail.component.html',
	styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
	project: any = null;
	projectId: string = '';
	allProjects = data['Portfolio'];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private location: Location,
		private viewportScroller: ViewportScroller,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit(): void {
		// Scroll to top when component initializes
		this.scrollToTop();
		
		this.route.params.subscribe(params => {
			this.projectId = params['projectId'];
			// Find project by matching the URL-friendly name
			this.project = this.allProjects.find((p: any) => {
				const projectName = p.project.toLowerCase().replace(/\s+/g, '-');
				return projectName === this.projectId.toLowerCase();
			});

			// If project not found, redirect to 404 or portfolio
			if (!this.project) {
				this.router.navigate(['/404']);
			} else {
				// Scroll to top when project changes
				this.scrollToTop();
			}
		});
	}

	/**
	 * Scroll to top of the page
	 */
	private scrollToTop(): void {
		// Use ViewportScroller for better compatibility
		this.viewportScroller.scrollToPosition([0, 0]);
		// Fallback to window.scrollTo for immediate effect
		window.scrollTo(0, 0);
	}

	goBack(): void {
		this.location.back();
	}

	getProjectImage(): string {
		if (!this.project) return '';
		return `assets/images/portfolio/${this.project.project}.png`;
	}

	getProjectName(): string {
		if (!this.project) return '';
		return this.project.project.replaceAll('-', ' ');
	}

	/**
	 * Get the content blocks for the current project.
	 * If project has a 'content' array, use it. Otherwise, fall back to default structure.
	 * 
	 * Content block types:
	 * - 'text': Plain text paragraph
	 * - 'heading': Heading text (h2, h3, etc.)
	 * - 'image': Single image
	 * - 'video': Video element
	 * - 'gallery': Multiple images in a grid
	 * - 'technologies': Technology badges
	 * - 'link': External link button
	 * 
	 * Example content array:
	 * content: [
	 *   { type: 'text', text: 'Introduction paragraph...' },
	 *   { type: 'image', src: 'assets/images/portfolio/image1.png', alt: 'Description' },
	 *   { type: 'heading', level: 3, text: 'Section Title' },
	 *   { type: 'text', text: 'More content...' },
	 *   { type: 'video', src: 'assets/videos/demo.mp4', poster: 'assets/images/poster.png' },
	 *   { type: 'gallery', images: ['img1.png', 'img2.png'] },
	 *   { type: 'technologies', technologies: ['Unity', 'C#'] },
	 *   { type: 'link', url: 'https://...', text: 'View Project' }
	 * ]
	 */
	getProjectContent(): any[] {
		if (!this.project) return [];
		// If project has custom content blocks, use them
		if (this.project.content && Array.isArray(this.project.content)) {
			return this.project.content;
		}
		// Otherwise, return empty array (will use default template)
		return [];
	}

	/**
	 * Check if project uses custom content blocks
	 */
	hasCustomContent(): boolean {
		return this.project && this.project.content && Array.isArray(this.project.content) && this.project.content.length > 0;
	}

	/**
	 * Get image source from content block
	 */
	getImageSrc(block: any): string {
		if (block.src) {
			// If src is a full path, use it as is
			if (block.src.startsWith('http') || block.src.startsWith('/') || block.src.startsWith('assets/')) {
				return block.src;
			}
			// Otherwise, assume it's in portfolio folder
			return `assets/images/portfolio/${block.src}`;
		}
		return '';
	}

	/**
	 * Get video source from content block
	 */
	getVideoSrc(block: any): string {
		if (block.src) {
			if (block.src.startsWith('http') || block.src.startsWith('/') || block.src.startsWith('assets/')) {
				return block.src;
			}
			return `assets/videos/${block.src}`;
		}
		return '';
	}

	getNextProject(): any {
		if (!this.project) return null;
		const currentIndex = this.allProjects.findIndex((p: any) => p.project === this.project.project);
		const nextIndex = (currentIndex + 1) % this.allProjects.length;
		return this.allProjects[nextIndex];
	}

	getPreviousProject(): any {
		if (!this.project) return null;
		const currentIndex = this.allProjects.findIndex((p: any) => p.project === this.project.project);
		const prevIndex = currentIndex === 0 ? this.allProjects.length - 1 : currentIndex - 1;
		return this.allProjects[prevIndex];
	}

	navigateToProject(project: any): void {
		const projectName = project.project.toLowerCase().replace(/\s+/g, '-');
		this.router.navigate(['/portfolio', projectName]);
	}

	/**
	 * Get Bootstrap column classes for gallery based on number of columns
	 */
	getGalleryColumnClass(columns: number): string {
		const colWidth = 12 / columns;
		// Ensure we get a whole number (should always be the case for 2, 3, 4, 6 columns)
		const colClass = Math.floor(colWidth);
		// Use col-12 for mobile (stack), col-md-* for medium screens and up
		return `col-12 col-md-${colClass} mb-3`;
	}

	/**
	 * Check if the video block is a YouTube embed
	 */
	isYouTubeEmbed(block: any): boolean {
		if (!block || !block.url) return false;
		return block.url.includes('youtube.com/embed') || block.url.includes('youtu.be');
	}

	/**
	 * Sanitize URL for iframe embedding (required by Angular for security)
	 */
	getSafeUrl(url: string): SafeResourceUrl {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
