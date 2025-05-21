const imageContainer = document.getElementById('image-container');
const images = [
    'images/image1.jpg',
    'images/image2.jpg',
    'images/image3.jpg',
    'images/image4.jpg',
    'images/image5.jpg'
];

function loadImages() {
    images.forEach(imageSrc => {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        imgElement.alt = 'Gallery Image';
        imgElement.classList.add('gallery-image');
        imgElement.addEventListener('click', () => {
            openLightbox(imageSrc);
        });
        imageContainer.appendChild(imgElement);
    });
}

function openLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox');
    const img = document.createElement('img');
    img.src = imageSrc;
    lightbox.appendChild(img);
    lightbox.addEventListener('click', () => {
        lightbox.remove();
    });
    document.body.appendChild(lightbox);
}

document.addEventListener('DOMContentLoaded', loadImages);