class Tabela
{
    constructor(o)
    {
        this._previousString = 'Anterior';
        this._nextString = 'Próximo';
        this._defaultContent = 'Nenhum Registro para exibir';

        this._tabela = document.getElementById(o.id);
        this._tbody = this._tabela.querySelector('body');
        this._multiSelect = o.multiSelect ? true : false;
        this._columns = o.columns === undefined ? null : o.columns;
        this._url = o.url === undefined ? null : o.url;
        this._ajaxOnLoad = o.ajaxOnLoad ? true : false;
        this._afterClick = typeof o.afterClick === 'function' ? o.afterClick : null;
        this._isSelected = false;
        this._paginate = o.paginate === 'undefined' ? true : o.paginate;
        this._page = 1;
        this._config();
    }

    _config()
    {
        //configurando cliques
        this._tabela.onclick = e => this.click(e);

        //configurando nome das colunas automanticamente se o programador não o fizer
        if(!this._columns) {
            let a = this._tabela.querySelectorAll('th');
            let i = a.length;
            this._columns = [];
            while (i--) {
               this._columns[i] = a[i].textContent.toLowerCase().replace(/[^a-z0-9_]/ig, "_");
            }
        }

        //baixando dados do ajax se estiver habilitado
        if(this._ajaxOnLoad) {
            this.ajaxLoad();
        } else {//configurando linha padrão se tabela estiver vazia
            if(!this._tbody)
                this.setData();
        }
    }

    //ajax que modifica os valores da tabela
    //usado somente se this._url estiver configurado
    ajaxLoad()
    {
        if(!this._url) throw new Error('You forgot to configure url to update grid');
        Ajax.ajax({
            url: `${this._url}?page=${this._page}`,
            method: 'get',
            // data: {page: this._page},
            success: (e) => {
                this.setData(e);
            }
        });
        // Ajax.get(this._url, (e) => {
        //     this.setData(e);
        // });
    }

    click(e)
    {
        //nao faz nada se o clique foi numa linha padrão (vazia)
        if(e.target.parentNode.dataset.empty) return false;

        //nao faz nada se o clique não foi no corpo da tabela
        else if(e.target.tagName !== 'TD') return false;


        if(this._multiSelect)
            this.clickMulti(e);
        else
            this.clickSingle(e);

        this._isSelected = e.target.parentNode.classList.contains('selected');
        if(this._afterClick) this._afterClick(e);

    }

    clickMulti(e)
    {
        let parent = e.target.parentNode;
        let selected = this.getSelectedTr();

        //verificando se linha clicada já está selecionada
        if(this.contains(selected, parent)) {
            parent.classList.remove('selected');
        } else {
            parent.classList.add('selected');
        }
    }

    clickSingle(e)
    {
        let selected = this.getSelectedTr();
        let parent = e.target.parentNode;

        if(selected === null) {//se nada estiver selecionado
            parent.classList.add('selected');
        } else if(selected !== null) {//havia linha selecionada
            if(selected !== parent) {//linha atual diferente da anterior
                selected.classList.remove('selected');
                parent.classList.add('selected');
            } else //clique na mesma linha
                selected.classList.remove('selected');
        }
    }

    //retorna um array de objeto, sendo que cada objeto é um json {nome_coluna:texo_coluna}
    getSelected()
    {
        let selected = this.getSelectedTr();
        if(selected === null) return null;//nada selecionado

        if(this._multiSelect) return this._getSelectedMulti(selected);
        else return this._getSelectedSingle(selected);
    }

    //retorna true ou false se há alguma linha selecionada na tabela
    isSelected()
    {
        return this._isSelected;
    }

    //substitui as linhas da tabela por novas linhas enviadas no array de objetos [{nome_coluna:valor},{nome_coluna:valor}]
    //se estiver vazio coloca a mensagem padrão centralizada na tabela
    setData(e)
    {
        let body = this._tabela.querySelector('tbody');
        if(typeof e === 'undefined' || e.length === 0)
            body.innerHTML = `<tr data-empty="true"><td colspan="${this._columns.length}" style="text-align:center">${this._defaultContent}</td></tr>`;
        else {
            let lines = '';
            for (let i = 0; i < e.data.length; i++) {//percorrendo as colunas existentes
                lines += this.setLine(e.data[i]);
            }
            body.innerHTML = lines;
        }

        if(this._paginate) {
            this.showPagination(e);
        }
    }

    //cria a string html de uma única linha com os dados passados como argumento {nome_coluna:valor}
    setLine(e)
    {
        let columns = '';
        for(let i = 0; i < this._columns.length; i++) {
            columns += `<td>${e[i]}</td>`;
        }
        return `<tr>${columns}</tr>`;
    }

    showPagination(e)
    {
       /*
        * verificar se página atual é 1 (desabilitar anterior)
        * verificar se página atual é a última (desabilitar próximo)
        * verificar se depois da página atual há +4 páginas (5,6...x)
        * verificar se antes da página atual há -4 páginas (x...4,5)
        */

        let p = new Pagination(e.page, e.total, e.length);
        let a = [];
        a.push({c:p.isFirst() ? 'disabled' : '', v:this._previousString});
        
        if(p.page < 5) {//se estiver nas primeiras 4 páginas
            
            for(let i = 1; i <= p.endOfBeginning(); i++) {
                if(p.page == i)
                    a.push({c:'active', v:i});
                else
                    a.push({v:i});
            }

            //se houver mais de 4 páginas
            if(p.lastPage() > 5) {
                a.push({c:'disabled', v:'...'});
                a.push({v:p.lastPage()});
            }
        }
        else if(p.hasNext() && (p.totalPages - p.next()) >= 4) {//a página atual possui mais 4 registros adiante
            
            a.push({v:1});
            a.push({c:'disabled', v:'...'});
            a.push({v:p.previous()});
            a.push({c:'active', v:p.page});
            a.push({v:p.next()});
            a.push({c:'disabled', v:'...'});
            a.push({v:p.lastPage()});
        } else {//a página atual está entre as 5 últimas
            
            if(p.lastPage() > 5) {//se houver apenas 5 páginas não precisa colocar ...
                a.push({v:1});
                a.push({c:'disabled', v:'...'});
            }
            
            for(let i = p.beginOfTheEnd(); i <= p.lastPage(); i++) {
                if(p.page === i)
                    a.push({c:'active', v:i});
                else
                    a.push({v:i});
            }
        }
        a.push({c:p.isLastPage() ? 'disabled' : '', v:this._nextString});
        this._page = p.page;
        this._createPaginationButtons(a);
    }

    //retorna um objeto da linha selecionada {nome_coluna:valor, nome_coluna:valor}
    //usado somente quando this._multiSelect = false
    _getSelectedSingle(selected)
    {
        let a = {};
        for (let j = 0; j < this._columns.length; j++) {//percorrendo as colunas existentes
            a[this._columns[j]] = selected.children[j].textContent;
        }
        return a;
    }

    //retorna um array de objetos selecionados [{nome_coluna:valor, nome_coluna:valor}, {nome_coluna:valor, nome_coluna:valor}]
    //usado somente quando this._multiSelect = true
    _getSelectedMulti(selected)
    {
        let aResults = [];
        let a;
        for (let i = 0; i < selected.length; i++) {//percorrendo as linhas selecionadas
            a = {};
            for (let j = 0; j < this._columns.length; j++) {//percorrendo as colunas existentes
                a[this._columns[j]] = selected[i].children[j].textContent;
            }
            aResults.push(a);
        }
        return aResults;
    }
    //retorna o objeto tr ou um ListNode[tr] das linhas selecionadas
    getSelectedTr()
    {
        return this._multiSelect ? this._tabela.querySelectorAll('tbody .selected') : this._tabela.querySelector('tbody .selected');
    }

    //verifica se um array contem um objeto
    contains(a, obj)
    {
        let i = a.length;
        while (i--) {
           if (a[i] === obj) {
               return true;
           }
        }
        return false;
    }

    _createPaginationButtons(o)
    {
        let pagination = `${o.map( n => `<li ${typeof n.c == 'undefined' ? null : `class="${n.c}"`}><a ${n.c !== 'disabled' ? `href="${this._url}?page=${n.v}` : null}"}>${n.v}</a></li>`).join('')}`;
        pagination = `<nav class="pull-right" id="pagination" aria-label="Page navigation"><ul class="pagination">${pagination}</ul></nav>`;
    //     <nav aria-label="Page navigation">
    //     <ul class="pagination">
    //       <li>
    //         <a href="#" aria-label="Previous">
    //           <span aria-hidden="true">&laquo;</span>
    //         </a>
    //       </li>
    //       <li><a href="#">1</a></li>
    //       <li><a href="#">2</a></li>
    //       <li><a href="#">3</a></li>
    //       <li><a href="#">4</a></li>
    //       <li><a href="#">5</a></li>
    //       <li>
    //         <a href="#" aria-label="Next">
    //           <span aria-hidden="true">&raquo;</span>
    //         </a>
    //       </li>
    //     </ul>
    //   </nav>

        let nav = document.getElementById('pagination');
        if(nav)
            nav.innerHTML = pagination;
        else
            this._tabela.insertAdjacentHTML('afterend', pagination);

        let links = document.querySelectorAll('.pagination a');
        for(let i = 0; i < links.length; i++) {//colocando ouvinte em todos os links criados
            links[i].onclick = () => {//this aqui passa a ser a tag link
                return Reflect.apply(this._updateTable, this, [links[i]]);//modificando this para esta classe
            }
        }
        
    }

    _updateTable(e)
    {
        if(e.href != '') {
            if(e.textContent == this._previousString)
                --this._page;
            else if(e.textContent == this._nextString)
                ++this._page;
                
            else
                this._page = e.textContent;

            this.ajaxLoad();
        }
        
        return false;
    }
}

class Pagination
{
    constructor(page, total, length)
    {
        this._page = parseInt(page);
        this._total = parseInt(total);
        this._length = parseInt(length);
        this._totalPages = Math.ceil(total/length);        
    }

    previous()
    {
        return this._page -1;
    }

    next()
    {
        return this._page +1;
    }

    isFirst()
    {
        return this._page === 1;
    }

    isLastPage()
    {
        return this._page === this._totalPages;
    }

    lastPage()
    {
        return this._totalPages;
    }

    hasPrevious()
    {
        return this._page -4 > 0;
    }

    hasNext()
    {
        return this._page * this._length <= this._total;
    }

    endOfBeginning()
    {
        return 5 < this._totalPages ? 5 : this._totalPages;
    }

    beginOfTheEnd()
    {
        return (this._totalPages -4) > 1 ? this._totalPages -4 : 1;
    }

    get page()
    {
        return this._page;
    }
    
    get totalPages()
    {
        return this._totalPages;
    }
}