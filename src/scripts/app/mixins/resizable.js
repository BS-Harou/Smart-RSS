define(function () {

    let els = [];

    const resizeWidth = 6;

    function handleMouseDown(event) {
        this.resizing = true;
        event.preventDefault();
        [...document.querySelectorAll('iframe')].forEach((iframe) => {
            iframe.style.pointerEvents = 'none';
        });

        this.trigger('resize:before');
    }

    function handleMouseMove(event) {
        if (this.resizing) {
            const toLeft = 1;
            event.preventDefault();
            if (this.layout === 'vertical') {
                setPosition.call(this, event.clientY);
                this.el.style.flexBasis = Math.abs(event.clientY - this.el.offsetTop + toLeft) + 'px';
            } else {
                setPosition.call(this, event.clientX);
                this.el.style.flexBasis = Math.abs(event.clientX - this.el.offsetLeft + toLeft) + 'px';
            }
            this.trigger('resize');
        }
    }

    function handleMouseUp() {
        if (!this.resizing) {
            return;
        }
        [...document.querySelectorAll('iframe')].forEach((iframe) => {
            iframe.style.pointerEvents = 'auto';
        });
        this.resizing = false;
        els.forEach((el) => {
            loadPosition.call(el);
        });

        this.trigger('resize:after');
    }

    function setPosition(pos) {
        const toLeft = 1;
        if (this.layout === 'vertical') {
            this.resizer.style.width = this.el.innerWidth + 'px';
            this.resizer.style.left = this.el.offsetLeft + 'px';
            this.resizer.style.top = pos - Math.round(resizeWidth / 2) - toLeft + 'px';
        } else {
            this.resizer.style.top = this.el.offsetTop + 'px';
            this.resizer.style.left = pos - Math.round(resizeWidth / 2) - toLeft + 'px';
        }
    }

    function loadPosition(resetting) {
        if (!this.resizer) {
            return;
        }

        if (this.layout === 'vertical') {
            setPosition.call(this, this.el.offsetTop + this.el.offsetHeight);
        } else {
            setPosition.call(this, this.el.offsetLeft + this.el.offsetWidth);
        }

        if (!resetting) {
            resetPositions.call(this);
        }
    }

    function resetPositions() {
        requestAnimationFrame(() => {
            els.forEach((el) => {
                if (el === this) {
                    return;
                }
                loadPosition.call(el, true);
            });
        });
    }

    return {
        resizing: false,
        resizer: null,
        layout: 'horizontal',
        enableResizing: function (layout, size) {
            layout = this.layout = layout || 'horizontal';

            if (size) {
                this.el.style.flexBasis = size + 'px';
            }

            els.push(this);

            if (!this.resizer) {
                this.resizer = document.createElement('div');
                this.resizer.className = 'resizer';
            }

            if (layout === 'vertical') {
                this.resizer.style.width = '100%';
                this.resizer.style.cursor = 'n-resize';
                this.resizer.style.height = resizeWidth + 'px';
            } else {
                this.resizer.style.height = '100%';
                this.resizer.style.cursor = 'w-resize';
                this.resizer.style.width = resizeWidth + 'px';
            }


            loadPosition.call(this);

            this.resizer.addEventListener('mousedown', handleMouseDown.bind(this));
            document.addEventListener('mousemove', handleMouseMove.bind(this));
            document.addEventListener('mouseup', handleMouseUp.bind(this));
            window.addEventListener('resize', resetPositions.bind(this));

            document.body.appendChild(this.resizer);
        }
    };
});
