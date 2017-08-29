## Tabela
Tabela is a simple table with ajax pagination with pure javascript. No jQuery required or any other dependencies. Just import into your project and have fun =)

## Demo
- [Simple table](https://philipebarra.github.io/tabela/examples/example1/)
- [Ajax](https://philipebarra.github.io/tabela/examples/example2/)
 
## Usage

1. import css
```html
<link rel="stylesheet" type="text/css" href="tabela.css">
```
2. import js
```html
<script src="Ajax.js"></script>
<script src="Tabela.js"></script>
```

3. create html table
```html
<table id="tabela">
    <thead>
        <tr>
            <th>Nome</th>
            <th>Sobrenome</th>
        </tr>
    <tbody>
    </tbody>
</table>
```
4. initialize table
```javascript
<script>
    tabela = new Tabela({id: 'tabela'});
</script>
```