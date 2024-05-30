include Glimmer

class Node < Struct.new(:type, :opts, :inner)
  class << self
    def elem(*inner, **opts) = Node.new(:elem, opts, inner)
    def layout(style, *inner, **) = Node.new(:layout, {style:, **}, inner)
    def atom(style, **) = Node.new(:atom, {style:, **}, nil)

    # Layouts
    def vbox(*, **) = self.layout(:box, *, dir: :vertical, **)
    def hbox(*, **) = self.layout(:box, *, dir: :horizontal, **)
    def bracket(...) = self.layout(:bracket, ...)

    # Atoms
    def label(text, **) = self.atom(:label, text:, **)
    def head(text, **) = self.label(text, primary: true, **)
    def hint(text, **) = self.label(text, opacity: 0.36, **)
  end
end

@src =
  Node.vbox(
    Node.elem(
      Node.head('for', color: 'func'),
      Node.vbox(
        Node.bracket(
          Node.elem(
            Node.head('index', color: 'var')),
          Node.hint('in'),
          Node.elem(
            Node.head('Ary', color: 'func'),
            Node.bracket(
              Node.elem(
                Node.head('1', color: 'val')),
              Node.elem(
                Node.head('2', color: 'val')),
              Node.elem(
                Node.head('3', color: 'val'))))),
        Node.bracket(
          Node.vbox(
            Node.elem(
              Node.hint('this is a comment')),
            Node.elem(
              Node.elem(
                Node.head('x', color: 'var')),
              Node.head('=', color: 'opt'),
              Node.elem(
                Node.elem(
                  Node.head('index', color: 'var')),
                Node.head('+', color: 'opt'),
                Node.elem(
                  Node.head('1', color: 'val')))),
            Node.elem(
              Node.hint('...')))))))

class NodeView
  include Glimmer::Web::Component

  option :node

  markup {
    case node.type
    when :elem
      div(class: 'n t-elem') { |node_elem|
        onclick do |e|
          e.stop_propagation
          node_elem.trigger 'elemactive'
        end
        node.inner.each { |n| node_view(node: n) }
      }
    when :layout
      case node.opts[:style]
        # Q: Can I shrink the repetitions below in some way?
      when :box
        div(class: "n t-layout s-box f-dir-#{node.opts[:dir]}") {
          node.inner.each { |n| node_view(node: n) }
        }
      when :bracket
        div(class: 'n t-layout s-bracket') {
          node.inner.each { |n| node_view(node: n) }
        }
      end
    when :atom
      case node.opts[:style]
      when :label
        klass = 'n t-atom s-label'
        klass += ' f-primary' if node.opts[:primary]
        style = ''
        case
        when v = node.opts[:opacity] then style += "opacity: #{v};"
        when v = node.opts[:color] then style += "--color: var(--c-#{v});"
        end
        span(class: klass, style:) {node.opts[:text]}
      end
    end
  }
end

class Editor
  include Glimmer::Web::Component

  options :node, :cursor

  attr_reader :active_elem
  def active_elem=(elem)
    if elem != @active_elem
      pos = elem.position
      if @e_cursor
          # do not work somehow
        @e_cursor.css '--x', "#{pos.left}px"
        @e_cursor.css '--y', "#{pos.top}px"
        @e_cursor.css '--w', "#{elem.width}px"
        @e_cursor.css '--h', "#{elem.height}px"
      end
      @active_elem = elem
    end
  end

  markup {
    div(class: 'editor') {
      node_view(node: node)
      div(class: 'ed-overlay') {
        @e_cursor = div(class: 'i-cursor')
      }
      onelemactive do |e|
        e.stop_propagation
        self.active_elem = e.target
      end
    }
  }
end

Document.ready? do
  editor(node: @src)
  # link(rel: 'stylesheet', href: './style.css')
  style {'body{background:#181818;color:#fff;font-family:"Source Code Pro",monospace;font-size:16px}.editor{--c-fg:#cccccc;--c-var:#9CDCFE;--c-func:#C586C0;--c-opt:#569CD6;--c-val:#B5CEA8;--rt-color:#666666;--rt-border:1px;--rt-width:max(calc(0.5em - var(--rt-border) - 4px), 2px);display:flex;flex-direction:column;user-select:none}.n{display:flex}.t-elem:not(:has(.t-elem:hover)):hover{outline:solid 1px #2f6593;position:relative;z-index:1}.t-elem:not(:has(.t-elem:hover)):hover>.f-primary{outline:solid 2px #5392c9;position:relative;z-index:1}.t-elem:not(:has(.t-elem:hover)):hover .t-elem:not(.t-elem:not(:has(.t-elem:hover)):hover .t-elem .t-elem){background:#123656}.t-atom{padding:0 .25em}.t-layout.s-box,.t-layout.s-bracket{flex-grow:1}.t-layout.s-bracket:has(.t-layout.s-box.f-dir-vertical:last-child)::after{content:none}.t-layout.s-box.f-dir-vertical{flex-direction:column}.t-layout.s-bracket::before,.t-layout.s-bracket::after{content:" ";margin:4px 2px;width:var(--rt-width);border:var(--rt-border) solid var(--rt-color)}.t-layout.s-bracket::before{border-right:0 none}.t-layout.s-bracket::after{border-left:0 none}.t-atom.s-label{align-self:start;color:var(--color,--c-fg)}'}
end
